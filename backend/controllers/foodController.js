const FoodOrder = require('../models/FoodOrder');

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
        const order = new FoodOrder(req.body);
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
