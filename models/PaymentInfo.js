// models/PaymentInfo.js
const mongoose = require('mongoose');

const paymentInfoSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cardName: { type: String, required: true },
    cardNumber: { type: String, required: true, unique: true },
    isDefault: { type: Boolean, default: false }
});

module.exports = mongoose.model('PaymentInfo', paymentInfoSchema);
