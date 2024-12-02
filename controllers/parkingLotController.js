const ParkingLot = require('../models/ParkingLot');

// Get all parking lots and their available spaces
// In your parkingLotController
exports.getParkingLots = async (req, res) => {
    try {
        const lots = await ParkingLot.find({});
        res.json(lots);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Method to create a new parking lot
exports.createParkingLot = async (req, res) => {
    try {
        const { name, location, totalSpots, availableSpots } = req.body;
        const newLot = new ParkingLot({
            name,
            location,
            totalSpots,
            availableSpots
        });
        await newLot.save();
        res.status(201).json(newLot);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create parking lot: ' + error.message });
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

const mongoose = require('mongoose');

exports.decrementParkingLotAvailability = async (req, res) => {
    try {
        const { lotId } = req.body;
        console.log('Received lotId:', lotId);

        // Validate and convert lotId to ObjectId
        if (!mongoose.Types.ObjectId.isValid(lotId)) {
            console.error('Invalid ObjectId:', lotId);
            return res.status(400).json({ error: 'Invalid parking lot ID' });
        }

        // Find the parking lot (no need to manually convert lotId)
        const parkingLot = await ParkingLot.findById(lotId);
        if (!parkingLot) {
            console.error('Parking lot not found for ID:', lotId);
            return res.status(404).json({ error: 'Parking lot not found' });
        }
        console.log('Found parking lot:', parkingLot);

        // Decrement availability
        if (parkingLot.availableSpots > 0) {
            parkingLot.availableSpots -= 1;
            await parkingLot.save();
            console.log('Decremented availability:', parkingLot.availableSpots);
            return res.status(200).json({ success: true, availableSpots: parkingLot.availableSpots });
        } else {
            console.warn('No spots available in parking lot:', parkingLot);
            return res.status(400).json({ error: 'No spots available' });
        }
    } catch (error) {
        console.error('Internal server error in decrementParkingLotAvailability:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};

 

exports.incrementParkingLotAvailability = async (req, res) => {
    const { lotId } = req.body;

    // Validate and convert lotId to ObjectId
    if (!mongoose.Types.ObjectId.isValid(lotId)) {
        console.error('Invalid ObjectId:', lotId);
        return res.status(400).json({ error: 'Invalid parking lot ID' });
    }

    try {
        // Find the parking lot using the validated ObjectId
        const parkingLot = await ParkingLot.findById(lotId);
        if (!parkingLot) {
            console.error('Parking lot not found for ID:', lotId);
            return res.status(404).json({ error: 'Parking lot not found' });
        }

        // Increment availability
        parkingLot.availableSpots += 1;
        await parkingLot.save();

        console.log('Incremented availability to:', parkingLot.availableSpots);
        return res.status(200).json({ availableSpots: parkingLot.availableSpots });
    } catch (error) {
        console.error('Error incrementing availability:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};







