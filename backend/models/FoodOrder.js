const mongoose = require('mongoose');

const foodOrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: false },
    ticketId: { type: String, required: true },
    items: [
        {
            menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
            name: { type: String, required: true },
            quantity: { type: Number, required: true, default: 1 },
            price: { type: Number, required: true },
            stallNumber: { type: String, required: true }
        }
    ],
    totalAmount: { type: Number, required: true },
    pickupSlot: { type: String, required: true },
    qrString: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Ready', 'Picked Up'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FoodOrder', foodOrderSchema);
