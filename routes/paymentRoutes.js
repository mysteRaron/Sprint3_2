const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/', paymentController.addPaymentInfo);
router.put('/update', paymentController.updatePaymentInfo);

module.exports = router;

