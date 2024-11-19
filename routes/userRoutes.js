const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/authMiddleware'); // Middleware to verify if user is logged in

// Register a new user
router.post('/register', userController.registerUser);

// Login an existing user
router.post('/login', userController.loginUser);

// Logout the current user
router.post('/logout', userController.logoutUser);

// Get current user's profile using /me to signify the logged-in user
router.get('/me', isAuthenticated, userController.getUserProfile);

// Update current user's information
router.put('/me', isAuthenticated, userController.updateUser);

module.exports = router;

