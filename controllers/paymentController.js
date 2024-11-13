const PaymentInfo = require('../models/PaymentInfo');

// Add payment information
exports.addPaymentInfo = async (req, res) => {
    try {
        const { userId, cardName, cardNumber } = req.body;
        const newPaymentInfo = new PaymentInfo({ user: userId, cardName, cardNumber });
        await newPaymentInfo.save();
        res.status(201).json({ message: 'Payment information saved successfully!' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update payment information
exports.updatePaymentInfo = async (req, res) => {
    try {
        const { cardName, cardNumber } = req.body;
        const updatedPaymentInfo = await PaymentInfo.findOneAndUpdate(
            { cardNumber },
            { cardName },
            { new: true }
        );
        if (!updatedPaymentInfo) throw new Error('Payment information not found');
        res.status(200).json({ message: 'Payment information updated successfully!', updatedPaymentInfo });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

