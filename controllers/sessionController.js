const ParkingSession = require('../models/ParkingSession');

// Start a new parking session
exports.startSession = async (req, res) => {
    try {
        const { userId, parkingLot, hours, totalCost } = req.body;
        const newSession = new ParkingSession({
            user: userId,
            parkingLot,
            hours,
            totalCost,
            startTime: new Date()
        });
        await newSession.save();
        res.status(201).json({ message: 'Parking session started successfully!' });
    } catch (error) {
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

