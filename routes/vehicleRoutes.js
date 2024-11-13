const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { isAuthenticated } = require('../middleware/authMiddleware'); // Assuming you have an auth middleware

// Route to add vehicle info for the authenticated user
router.post('/me', isAuthenticated, vehicleController.addVehicle);

// Route to update vehicle info for the authenticated user
router.put('/me/update', isAuthenticated, vehicleController.updateVehicle);

// Route to get all vehicles for the authenticated user
router.get('/me', isAuthenticated, vehicleController.getUserVehicles);

module.exports = router;

