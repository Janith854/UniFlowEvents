const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, enum: ['Snacks', 'Meals', 'Beverages'], required: true },
    price: { type: Number, required: true },
    stockCount: { type: Number, required: true, default: 0 },
    ecoScore: { type: Number, required: true, min: 0, max: 100 },
    image: { type: String, required: false },
    stallNumber: { type: String, required: true, default: 'Stall 1' }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
