const FoodOrder = require('../models/FoodOrder');
const MenuItem = require('../models/MenuItem');
const CartLock = require('../models/CartLock');
const User = require('../models/User');
const crypto = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Validates inventory and creates a food order.
 * Handles stock reduction and payment session generation.
 */
exports.processFoodOrder = async (userId, orderData) => {
    const { ticketId, items, pickupSlot, event, paymentMethod } = orderData;

    // 1. Prevent duplicate orders
    const duplicateOrder = await FoodOrder.findOne({ ticketId: ticketId.trim() });
    if (duplicateOrder) throw new Error('A food order has already been placed for this ticket.');

    // 2. Process items and calculate total
    let serverTotalAmount = 0;
    const processedItems = [];
    const MAX_QTY = 10;

    for (const item of items) {
        const qty = Number(item.quantity);
        if (!qty || qty < 1 || qty > MAX_QTY) throw new Error(`Invalid quantity for ${item.name}`);

        const menuItem = await MenuItem.findById(item.menuItem || item.id || item._id);
        if (!menuItem) throw new Error(`Menu item not found: ${item.name}`);

        serverTotalAmount += menuItem.price * qty;

        // Stock handling (priority to CartLock)
        const lock = await CartLock.findOne({ ticketId, menuItem: menuItem._id });
        if (lock) {
            menuItem.stockCount -= qty;
            await menuItem.save();
            await CartLock.deleteOne({ _id: lock._id });
        } else {
            if (menuItem.stockCount < qty) throw new Error(`Not enough stock for ${menuItem.name}`);
            menuItem.stockCount -= qty;
            await menuItem.save();
        }

        processedItems.push({
            menuItem: menuItem._id,
            name: menuItem.name,
            quantity: qty,
            price: menuItem.price,
            stallNumber: item.stallNumber || menuItem.stallNumber || 'General Stall'
        });
    }

    // 3. Loyalty reward check
    const dbUser = await User.findById(userId);
    if (dbUser && dbUser.activeVouchers?.includes('5_EVENT_SNACK_REWARD')) {
        const eligibleItem = processedItems.find(i => ['Caramel Popcorn', 'Iced Lemon Tea'].includes(i.name));
        if (eligibleItem) {
            serverTotalAmount -= eligibleItem.price;
            dbUser.activeVouchers = dbUser.activeVouchers.filter(v => v !== '5_EVENT_SNACK_REWARD');
            await dbUser.save();
        }
    }

    // 4. Generate QR Payload
    const stallMap = {};
    processedItems.forEach(i => {
        const sn = i.stallNumber;
        if (!stallMap[sn]) stallMap[sn] = [];
        stallMap[sn].push(`${i.quantity}x ${i.name}`);
    });
    const qrPayload = { id: `QR-${crypto.randomBytes(4).toString('hex').toUpperCase()}`, ticketId, pickupSlot, stalls: stallMap };

    // 5. Create order
    const order = new FoodOrder({
        user: userId,
        event,
        ticketId: ticketId.trim(),
        items: processedItems,
        totalAmount: Math.max(0, serverTotalAmount),
        pickupSlot,
        paymentMethod,
        qrString: JSON.stringify(qrPayload),
        status: 'Pending',
        paymentStatus: paymentMethod === 'Card' ? (serverTotalAmount > 0 ? 'Pending' : 'Paid') : 'Pay at Counter'
    });

    await order.save();
    return order;
};

/**
 * Creates a Stripe checkout session for a food order.
 */
exports.createStripeSession = async (order) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'lkr',
                    product_data: { name: 'UniFlow Food Order' },
                    unit_amount: Math.round(order.totalAmount * 100),
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/food/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/food`,
            metadata: { orderId: order._id.toString() }
        });
        return session;
    } catch (err) {
        console.warn('Stripe fail, mock provided:', err.message);
        return { id: `MOCK_SESSION_${Date.now()}`, url: `${process.env.FRONTEND_URL}/food/success?session_id=MOCK_SESSION_${Date.now()}` };
    }
};
