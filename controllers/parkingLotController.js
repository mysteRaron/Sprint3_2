const ParkingLot = require('../models/ParkingLot');

// Get all parking lots and their available spaces
exports.getParkingLots = async (req, res) => {
    try {
        const lots = await ParkingLot.find({});
        res.status(200).json(lots);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update parking lot availability (e.g., decrement when a session starts, increment when it ends)
exports.updateParkingLotAvailability = async (req, res) => {
    try {
        const { lotId, adjustment } = req.body;
        const lot = await ParkingLot.findById(lotId);

        if (!lot) return res.status(404).json({ message: "Parking lot not found" });

        lot.availableSpots += adjustment; // adjustment is -1 to decrease, +1 to increase
        lot.availableSpots = Math.max(0, lot.availableSpots); // Ensure it doesn’t go negative
        await lot.save();

        res.status(200).json(lot);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

