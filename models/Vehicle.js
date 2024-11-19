// models/Vehicle.js
const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    licensePlate: { type: String, required: true },
    state: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
