const FoodOrder = require('../models/FoodOrder');
const MenuItem = require('../models/MenuItem');
const CartLock = require('../models/CartLock');
const User = require('../models/User');
const crypto = require('crypto');

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
        const { ticketId, items, totalAmount, pickupSlot, event, user } = req.body;
        
        if (!ticketId) {
            return res.status(400).json({ msg: 'Valid TicketID is required to place a food order.' });
        }

        // Validate using Locks first, fall back to direct stock check if lock expired
        for (const item of items) {
            const menuId = item.menuItem || item.id || item._id;
            const menuItem = await MenuItem.findById(menuId);
            if (!menuItem) {
                return res.status(404).json({ msg: `Menu item not found: ${item.name}` });
            }

            const lock = await CartLock.findOne({ ticketId, menuItem: menuId });
            if (lock) {
                // Lock still alive — consume it
                menuItem.stockCount -= item.quantity;
                await menuItem.save();
                await CartLock.deleteOne({ _id: lock._id });
            } else {
                // Lock expired (TTL) — fall back to real-time stock check
                if (menuItem.stockCount < item.quantity) {
                    return res.status(400).json({ msg: `Not enough stock for ${item.name}. Only ${menuItem.stockCount} left.` });
                }
                menuItem.stockCount -= item.quantity;
                await menuItem.save();
            }
        }

        if (req.user) {
            const dbUser = await User.findById(req.user._id);
            if (dbUser && dbUser.activeVouchers && dbUser.activeVouchers.includes('5_EVENT_SNACK_REWARD')) {
                const eligible = items.some(i => i.name === 'Caramel Popcorn' || i.name === 'Iced Lemon Tea');
                if (eligible) {
                    dbUser.activeVouchers = dbUser.activeVouchers.filter(v => v !== '5_EVENT_SNACK_REWARD');
                    await dbUser.save();
                }
            }
        }

        const stallMap = {};
        for (const item of items) {
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
            user: (req.user && req.user._id) || user,
            event,
            ticketId,
            items: items.map(i => ({
                menuItem: i.menuItem || i.id || i._id,
                name: i.name,
                quantity: i.quantity,
                price: i.price,
                stallNumber: i.stallNumber || 'General Stall'
            })),
            totalAmount,
            pickupSlot,
            qrString,
            status: 'Pending'
        });

        await order.save();
        res.status(201).json(order);
    } catch (err) {
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
