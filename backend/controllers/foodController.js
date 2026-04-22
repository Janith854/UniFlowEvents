const FoodOrder = require('../models/FoodOrder');
const MenuItem = require('../models/MenuItem');
const CartLock = require('../models/CartLock');
const User = require('../models/User');
const crypto = require('crypto');

// Lazy-initialize Stripe to avoid crash when STRIPE_SECRET_KEY is not set at startup
const getStripe = () => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not configured in .env');
    return require('stripe')(key);
};

exports.addCartLock = async (req, res) => {
    try {
        const { ticketId, menuItemId, quantity } = req.body;
        if (!ticketId || !menuItemId || !quantity) return res.status(400).json({ msg: 'Missing fields' });

        const menuItem = await MenuItem.findById(menuItemId);
        if (!menuItem) return res.status(404).json({ msg: 'Menu item not found' });

        // Sum active locks from all users
        const activeLocksAgg = await CartLock.aggregate([
            { $match: { menuItem: menuItem._id } },
            { $group: { _id: '$menuItem', totalLocked: { $sum: '$quantity' } } }
        ]);
        const totalLocked = activeLocksAgg.length > 0 ? activeLocksAgg[0].totalLocked : 0;
        
        const availableStock = menuItem.stockCount - totalLocked;
        if (availableStock < quantity) {
            return res.status(400).json({ msg: 'Not enough stock available globally' });
        }

        // Add or update lock for this user explicitly
        const existingLock = await CartLock.findOne({ ticketId, menuItem: menuItemId });
        if (existingLock) {
            existingLock.quantity += quantity;
            existingLock.createdAt = Date.now(); // reset TTL securely
            await existingLock.save();
        } else {
            const newLock = new CartLock({ ticketId, menuItem: menuItemId, quantity });
            await newLock.save();
        }

        res.status(200).json({ msg: 'Stock safely reserved' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.removeCartLock = async (req, res) => {
    try {
        const { ticketId, menuItemId } = req.body;
        if (!ticketId || !menuItemId) return res.status(400).json({ msg: 'Missing fields' });

        await CartLock.findOneAndDelete({ ticketId, menuItem: menuItemId });
        res.status(200).json({ msg: 'Lock released securely' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMenu = async (req, res) => {
    try {
        const menu = await MenuItem.find();
        res.json(menu);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getFoodOrders = async (req, res) => {
    try {
        const orders = await FoodOrder.find().populate('user', 'name email').populate('event', 'title');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createFoodOrder = async (req, res) => {
    try {
        const { ticketId, items, pickupSlot, event, paymentMethod } = req.body;
        // Never trust the client-supplied 'user' — always use the authenticated user's ID
        const userId = req.user._id;

        // ── 1. Required fields ──────────────────────────────────────────────
        if (!ticketId || !ticketId.trim()) {
            return res.status(400).json({ msg: 'A valid Event Ticket ID is required to place a food order.' });
        }
        if (!paymentMethod || !['Card', 'Cash'].includes(paymentMethod)) {
            return res.status(400).json({ msg: 'A valid payment method (Card or Cash) is required.' });
        }
        if (!pickupSlot) {
            return res.status(400).json({ msg: 'A pickup slot must be selected.' });
        }
        const validSlots = ['12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM'];
        if (!validSlots.includes(pickupSlot)) {
            return res.status(400).json({ msg: 'Invalid pickup slot. Choose from 12:00 PM, 12:30 PM, 1:00 PM, or 1:30 PM.' });
        }

        // ── 2. Items array must not be empty ────────────────────────────────
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ msg: 'Your cart is empty. Add at least one item before checking out.' });
        }

        // ── 3. Prevent duplicate orders for the same ticket ─────────────────
        const duplicateOrder = await FoodOrder.findOne({ ticketId: ticketId.trim() });
        if (duplicateOrder) {
            return res.status(409).json({ msg: 'A food order has already been placed for this event ticket. You cannot order twice on the same ticket.' });
        }

        // ── 4. Per-item validation: max qty, existence & stock ──────────────
        const MAX_QTY_PER_ITEM = 10;
        let serverTotalAmount = 0;
        const processedItems = []; // To store items with server-validated prices and details

        for (const item of items) {
            const qty = Number(item.quantity);

            if (!qty || qty < 1) {
                return res.status(400).json({ msg: `Invalid quantity for item: ${item.name}. Minimum is 1.` });
            }
            if (qty > MAX_QTY_PER_ITEM) {
                return res.status(400).json({ msg: `Maximum ${MAX_QTY_PER_ITEM} units allowed per item. You requested ${qty}x ${item.name}.` });
            }

            const menuId = item.menuItem || item.id || item._id;
            const menuItem = await MenuItem.findById(menuId);
            if (!menuItem) {
                return res.status(404).json({ msg: `Menu item not found: ${item.name}` });
            }

            // Use DB price (not client-supplied price) to prevent price manipulation
            serverTotalAmount += menuItem.price * qty;

            const lock = await CartLock.findOne({ ticketId, menuItem: menuId });
            if (lock) {
                menuItem.stockCount -= qty;
                await menuItem.save();
                await CartLock.deleteOne({ _id: lock._id });
            } else {
                if (menuItem.stockCount < qty) {
                    return res.status(400).json({ msg: `Not enough stock for "${menuItem.name}". Only ${menuItem.stockCount} left.` });
                }
                menuItem.stockCount -= qty;
                await menuItem.save();
            }

            processedItems.push({
                menuItem: menuId,
                name: menuItem.name,
                quantity: qty,
                price: menuItem.price,
                stallNumber: item.stallNumber || menuItem.stallNumber || 'General Stall'
            });
        }

        // ── 5. Apply loyalty voucher discount on serverTotalAmount ──────────
        if (req.user) {
            const dbUser = await User.findById(req.user._id);
            if (dbUser && dbUser.activeVouchers && dbUser.activeVouchers.includes('5_EVENT_SNACK_REWARD')) {
                const eligible = processedItems.some(i => i.name === 'Caramel Popcorn' || i.name === 'Iced Lemon Tea');
                if (eligible) {
                    const voucherItem = processedItems.find(i => i.name === 'Caramel Popcorn' || i.name === 'Iced Lemon Tea');
                    if (voucherItem) serverTotalAmount -= voucherItem.price;
                    dbUser.activeVouchers = dbUser.activeVouchers.filter(v => v !== '5_EVENT_SNACK_REWARD');
                    await dbUser.save();
                }
            }
        }

        const stallMap = {};
        for (const item of processedItems) {
            const sn = item.stallNumber || 'General Stall';
            if (!stallMap[sn]) stallMap[sn] = [];
            stallMap[sn].push(`${item.quantity}x ${item.name}`);
        }
        
        const qrPayload = {
            id: `QR-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
            ticketId,
            pickupSlot,
            stalls: stallMap
        };
        const qrString = JSON.stringify(qrPayload);

        const order = new FoodOrder({
            user: userId,
            event,
            ticketId: ticketId.trim(),
            items: processedItems,
            totalAmount: Math.max(0, serverTotalAmount), // server-calculated — client cannot spoof
            pickupSlot,
            paymentMethod,
            qrString,
            status: 'Pending',
            paymentStatus: paymentMethod === 'Card' ? (Math.max(0, serverTotalAmount) > 0 ? 'Pending' : 'Paid') : 'Pay at Counter'
        });

        await order.save();

        if (paymentMethod === 'Card' && order.totalAmount > 0) {
            let session;
            try {
                session = await getStripe().checkout.sessions.create({
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
                    success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/food/success?session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/food`,
                    metadata: { orderId: order._id.toString() }
                });
                order.stripeSessionId = session.id;
                await order.save();
                return res.status(201).json({ id: session.id, url: session.url, order });
            } catch (stripeErr) {
                console.warn('Stripe Session creation failed, falling back to Mock Payment:', stripeErr.message);
                const mockId = `MOCK_SESSION_${Date.now()}`;
                order.stripeSessionId = mockId;
                await order.save();
                return res.status(201).json({ id: mockId, url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/food/success?session_id=${mockId}`, order });
            }
        } else {
            // Free order or Cash on Pickup
            return res.status(201).json({ order, isFree: true });
        }
    } catch (err) {
        // Surface Mongoose validation errors cleanly
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ msg: messages.join(' | ') });
        }
        res.status(500).json({ error: err.message });
    }
};

exports.updateFoodOrder = async (req, res) => {
    try {
        const order = await FoodOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!order) return res.status(404).json({ msg: 'Order not found' });
        
        const io = req.app.get('io');
        if (io) {
            io.emit('food-order-status-changed', order);
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.confirmPayment = async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) return res.status(400).json({ msg: 'Session ID required' });

        const order = await FoodOrder.findOne({ stripeSessionId: sessionId });
        if (!order) return res.status(404).json({ msg: 'Order not found' });

        if (order.paymentStatus === 'Paid') {
            return res.json({ msg: 'Payment already confirmed', order });
        }

        // Verify with Stripe here if we had a full backend
        order.paymentStatus = 'Paid';
        await order.save();

        const io = req.app.get('io');
        if (io) io.emit('food-order-payment-confirmed', order);

        res.json({ msg: 'Payment confirmed successfully', order });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteFoodOrder = async (req, res) => {
    try {
        await FoodOrder.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Food order deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createMenuItem = async (req, res) => {
    try {
        const menuItem = new MenuItem(req.body);
        await menuItem.save();
        res.status(201).json(menuItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!menuItem) return res.status(404).json({ msg: 'Menu item not found' });
        res.json(menuItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteMenuItem = async (req, res) => {
    try {
        await MenuItem.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Menu item deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
