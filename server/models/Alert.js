const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  disasterType: {
    type: String,
    required: true,
    enum: ['Flood', 'Cyclone', 'Earthquake', 'Fire', 'Landslide', 'Heatwave', 'Other']
  },
  severity: {
    type: String,
    required: true,
    enum: ['Low', 'Moderate', 'High', 'Critical']
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  coordinates: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  },
  description: {
    type: String,
    required: true
  },
  safetyInstructions: {
    type: String,
    required: true
  },
  source: {
    type: String,
    default: 'DisasterGuard Emergency Operations'
  },
  status: {
    type: String,
    enum: ['Active', 'Monitoring', 'Resolved'],
    default: 'Active'
  },
  affectedPopulationEst: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for fast searching and severity filtering
alertSchema.index({ disasterType: 1, severity: 1, status: 1 });

module.exports = mongoose.models.Alert || mongoose.model('Alert', alertSchema);
