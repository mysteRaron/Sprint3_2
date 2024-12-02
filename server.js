const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import Routes
const userRoutes = require('./routes/userRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const parkingLotRoutes = require('./routes/parkingLotRoutes');

// Import Controller
const parkingLotController = require('./controllers/parkingLotController');

const app = express();

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true } // Set secure: true if using HTTPS
}));

// Serve static files
app.use(express.static(__dirname));

// Authentication Middleware for Protected Routes
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
}

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/payment-info', paymentRoutes);
app.use('/api/parking-sessions', sessionRoutes);
app.use('/api/parking-lots', parkingLotRoutes);

// Decrement Parking Lot Availability
app.post('/api/decrement-availability', (req, res) => {
    console.log('Request payload:', req.body);

    // Validate request payload
    const { lotId } = req.body;
    if (!lotId) {
        return res.status(400).json({ error: 'lotId is required' });
    }

    // Call the controller function
    parkingLotController.decrementParkingLotAvailability(req, res);
});

// Serve HTML files for views
app.get('/register', (req, res) => {
    if (req.session.userId) return res.redirect('/dashboard');
    res.sendFile(path.join(__dirname, 'views/register.html'));
});

app.get('/login', (req, res) => {
    if (req.session.userId) return res.redirect('/dashboard');
    res.sendFile(path.join(__dirname, 'views/login.html'));
});

app.get('/vehicle', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views/vehicle.html'));
});

app.get('/settings', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views/settings.html'));
});

app.get('/paymentInfo', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views/paymentInfo.html'));
});

app.get('/parking-lots', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views/parking-lots.html'));
});

app.get('/confirm-payment', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views/confirm-payment.html'));
});

app.get('/timer', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views/timer.html'));
});

app.get('/dashboard', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views/dashboard.html'));
});

// Add Parking Lot Form
app.get('/add-parking-lot', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/add-parking-lot.html'));
});

// Default route
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Failed to destroy session:', err);
            return res.status(500).send('Failed to log out');
        }
        res.redirect('/login');
    });
});

// API endpoint to fetch user's parking sessions
app.get('/api/parking-sessions', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const userId = req.user._id;  // Assumed to be set from the authentication middleware
        const sessions = await ParkingSession.find({ user: userId })
            .populate('parkingLot', 'name')  // Assuming you only need the name from parkingLot
            .populate('vehicle', 'make model')  // Assuming you want to include make and model of the vehicle
            .sort({ startTime: -1 })  // Sort by startTime descending
            .limit(10);  // Limits to the latest 10 sessions for example

        res.json(sessions);
    } catch (error) {
        console.error('Failed to fetch parking sessions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        body: req.body,
    });
    res.status(500).json({ error: 'An internal server error occurred' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




