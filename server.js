const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const parkingLotRoutes = require('./routes/parkingLotRoutes');

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

// Serve static files directly from the root directory
app.use(express.static(__dirname));

// Authentication Middleware for Protected Routes
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
}

// Define routes for API endpoints
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/payment-info', paymentRoutes);
app.use('/api/parking-sessions', sessionRoutes);
app.use('/api/parking-lots', parkingLotRoutes);

// Serve HTML files from the views folder
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

// Default route - redirect to login if not logged in
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'An internal server error occurred' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



