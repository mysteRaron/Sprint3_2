const Vehicle = require('../models/Vehicle');

// Add vehicle information
exports.addVehicle = async (req, res) => {
    try {
        // Ensure the user is logged in by checking the session
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized. Please log in first.' });
        }

        const { licensePlate, state, isDefault } = req.body;

        // If the user wants to set this vehicle as the default, update other vehicles to non-default
        if (isDefault) {
            await Vehicle.updateMany({ user: userId }, { isDefault: false });
        }

        const newVehicle = new Vehicle({ user: userId, licensePlate, state, isDefault });
        await newVehicle.save();
        res.status(201).json({ message: 'Vehicle information saved successfully!' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update vehicle information
exports.updateVehicle = async (req, res) => {
    try {
        // Ensure the user is logged in by checking the session
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized. Please log in first.' });
        }

        const { licensePlate, state, isDefault } = req.body;

        const vehicle = await Vehicle.findOne({ user: userId, licensePlate });
        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        // Update fields as necessary
        vehicle.state = state;

        // If setting this vehicle as default, update other vehicles to non-default
        if (isDefault) {
            await Vehicle.updateMany({ user: userId, _id: { $ne: vehicle._id } }, { isDefault: false });
            vehicle.isDefault = true;
        }

        await vehicle.save();
        res.status(200).json({ message: 'Vehicle updated successfully!', vehicle });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get user's vehicles
exports.getUserVehicles = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized. Please log in first.' });
        }

        const vehicles = await Vehicle.find({ user: userId });
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve vehicles' });
    }
};



