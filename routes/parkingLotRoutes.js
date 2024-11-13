const express = require('express');
const router = express.Router();
const parkingLotController = require('../controllers/parkingLotController');

// Get all parking lots
router.get('/', parkingLotController.getParkingLots);

// Update parking lot availability
router.patch('/update', parkingLotController.updateParkingLotAvailability);

module.exports = router;
