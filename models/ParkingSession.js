// models/ParkingSession.js
const mongoose = require('mongoose');

const parkingSessionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    parkingLot: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingLot', required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    startTime: { type: Date, default: Date.now },
    endTime: Date,
    duration: Number,  // In hours
    totalCost: Number
});

module.exports = mongoose.model('ParkingSession', parkingSessionSchema);
