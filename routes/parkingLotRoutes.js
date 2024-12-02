const express = require('express');
const router = express.Router();
const parkingLotController = require('../controllers/parkingLotController');

// Get all parking lots
router.get('/', parkingLotController.getParkingLots);

// POST route to create a new parking lot
router.post('/add', parkingLotController.createParkingLot);

// Update parking lot availability (supports decrement with action)
router.patch('/update', parkingLotController.updateParkingLotAvailability);

// Decrement parking lot availability (dedicated endpoint)
router.post('/decrement-availability', parkingLotController.decrementParkingLotAvailability);

// Increment parking lot availability
router.post('/increment-availability', parkingLotController.incrementParkingLotAvailability);



module.exports = router;

