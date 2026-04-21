const mongoose = require('mongoose');

const foodOrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: false },
    ticketId: { type: String, required: [true, 'TicketID is required'], trim: true },
    items: {
        type: [
            {
                menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
                name: { type: String, required: true, trim: true },
                quantity: {
                    type: Number,
                    required: true,
                    min: [1, 'Quantity must be at least 1'],
                    max: [10, 'Maximum 10 of any single item per order']
                },
                price: { type: Number, required: true, min: [0, 'Price cannot be negative'] },
                stallNumber: { type: String, required: true }
            }
        ],
        validate: {
            validator: function (arr) { return arr && arr.length > 0; },
            message: 'Order must contain at least one item'
        }
    },
    totalAmount: { type: Number, required: true, min: [0, 'Total amount cannot be negative'] },
    pickupSlot: {
        type: String,
        required: [true, 'Pickup slot is required'],
        enum: {
            values: ['12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM'],
            message: 'Invalid pickup slot selected'
        }
    },
    qrString: { type: String, required: true },
    paymentMethod: { type: String, enum: ['Card', 'Cash'], required: true },
    stripeSessionId: { type: String },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Pay at Counter'], default: 'Pending' },
    status: { type: String, enum: ['Pending', 'Ready', 'Picked Up'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FoodOrder', foodOrderSchema);
