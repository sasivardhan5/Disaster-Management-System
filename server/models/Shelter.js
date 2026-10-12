const mongoose = require('mongoose');

const shelterSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  coordinates: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  },
  capacity: {
    type: Number,
    required: true,
    min: 0
  },
  availableBeds: {
    type: Number,
    default: null
  },
  facilities: [{
    type: String,
    trim: true
  }],
  contactInfo: {
    type: String,
    default: 'Emergency Shelter Operations Desk'
  },
  operationalStatus: {
    type: String,
    enum: ['Open', 'Near Capacity', 'Closed', 'Preparing'],
    default: 'Open'
  },
  notes: {
    type: String,
    default: ''
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

shelterSchema.index({ operationalStatus: 1 });

module.exports = mongoose.models.Shelter || mongoose.model('Shelter', shelterSchema);
