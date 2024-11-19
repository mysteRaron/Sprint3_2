// models/ParkingLot.js
const mongoose = require('mongoose');

const parkingLotSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: String,
    totalSpots: { type: Number, required: true },
    availableSpots: { type: Number, required: true }
});

module.exports = mongoose.model('ParkingLot', parkingLotSchema);
