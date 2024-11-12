const User = require('../models/User');

// Register a new user
exports.registerUser = async (req, res) => {
    try {
        const { email, phone, password } = req.body;
        const newUser = new User({ email, phone, password });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Login user
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        // Verify if user exists and password matches
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Store user ID in session to keep track of logged-in user
        req.session.userId = user._id;
        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred during login' });
    }
};

// Logout user
exports.logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.status(200).json({ message: 'Logout successful' });
    });
};

// Update user information
exports.updateUser = async (req, res) => {
    try {
        const userId = req.session.userId; // Ensure user is logged in
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized. Please log in first.' });
        }

        const { phone, password } = req.body;

        // Find the logged-in user by session ID and update the details
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { phone, password },
            { new: true } // Return updated document
        );

        if (!updatedUser) throw new Error('User not found');
        res.status(200).json({ message: 'User updated successfully!', updatedUser });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get current user's profile
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized. Please log in first.' });
        }

        const user = await User.findById(userId).select('-password'); // Exclude password field
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve user profile' });
    }
};






