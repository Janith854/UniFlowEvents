const mongoose = require('mongoose');

const cartLockSchema = new mongoose.Schema({
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    ticketId: { type: String, required: true },
    quantity: { type: Number, required: true },
    createdAt: { type: Date, expires: 600, default: Date.now } // 10 minute TTL
});

// Compound index for fast queries when adding/removing locks for a specific user and item
cartLockSchema.index({ ticketId: 1, menuItem: 1 });

module.exports = mongoose.model('CartLock', cartLockSchema);
