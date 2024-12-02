const ParkingSession = require('../models/ParkingSession');
const User = require('../models/User'); // Import User model
const ParkingLot = require('../models/ParkingLot'); // Import ParkingLot model
const Vehicle = require('../models/Vehicle'); // Import Vehicle model

exports.startSession = async (req, res) => {
    try {
        // Fallback to hardcoded values if request body is missing
        const userId = req.body.user || "672e7e11c3cfa89b7de32f75"; // Replace with valid User ID
        const parkingLotId = req.body.parkingLot || "67391ec959d4d5684461d7fe"; // Replace with valid Parking Lot ID
        const vehicleId = req.body.vehicle || "672fa87ff2d528ef3fbf599e"; // Replace with valid Vehicle ID
        const hours = req.body.hours || 1; // Use provided hours or default to 1
        const totalCost = req.body.totalCost || hours * 10; // Calculate cost based on hours

        // Optional: Verify user, vehicle, and parking lot existence
        const userExists = await User.findById(userId);
        if (!userExists) return res.status(404).json({ error: 'User not found.' });

        const parkingLotExists = await ParkingLot.findById(parkingLotId);
        if (!parkingLotExists) return res.status(404).json({ error: 'Parking lot not found.' });

        const vehicleExists = await Vehicle.findById(vehicleId);
        if (!vehicleExists) return res.status(404).json({ error: 'Vehicle not found.' });

        // Create the parking session
        const newSession = new ParkingSession({
            user: userId,
            parkingLot: parkingLotId,
            vehicle: vehicleId,
            hours,
            totalCost,
            startTime: new Date()
        });

        await newSession.save();

        console.log('Parking session created successfully:', newSession);

        res.status(201).json({ message: 'Parking session started successfully!', session: newSession });
    } catch (error) {
        console.error('Error starting parking session:', error);
        res.status(400).json({ error: error.message });
    }
};



// Extend an existing parking session
exports.extendSession = async (req, res) => {
    try {
        const { sessionId, additionalHours, additionalCost } = req.body;
        const session = await ParkingSession.findById(sessionId);
        if (!session) throw new Error('Parking session not found');

        session.hours += additionalHours;
        session.totalCost += additionalCost;
        await session.save();

        res.status(200).json({ message: 'Parking session extended successfully!', session });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// In your parking session controller
exports.getUserSessions = async (req, res) => {
    try {
        const userId = req.session.userId; // Using session to extract user ID
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized. Please log in first.' });
        }

        // Assuming ParkingSession schema has a 'user' field that references User
        const sessions = await ParkingSession.find({ user: userId })
            .populate('parkingLot', 'name') // Populate parkingLot name
            .populate('vehicle', 'make model') // Populate vehicle make and model
            .sort({ startTime: -1 }); // Sorting by startTime in descending order

        res.status(200).json(sessions);
    } catch (error) {
        console.error("Failed to retrieve parking sessions:", error);
        res.status(500).json({ error: 'Failed to retrieve parking sessions' });
    }
};

