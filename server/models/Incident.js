const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  incidentType: {
    type: String,
    required: true,
    enum: [
      'Flood',
      'Cyclone',
      'Earthquake',
      'Fire',
      'Landslide',
      'Road blockage',
      'Building damage',
      'Medical emergency',
      'Other'
    ]
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  coordinates: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  affectedCount: {
    type: Number,
    default: 1,
    min: 0
  },
  urgencyLevel: {
    type: String,
    enum: ['Low', 'Moderate', 'High', 'Critical'],
    default: 'Moderate'
  },
  status: {
    type: String,
    enum: ['Submitted', 'Under Review', 'Verified', 'Response Assigned', 'Resolved'],
    default: 'Submitted'
  },
  verificationState: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending'
  },
  reportedBy: {
    type: String,
    default: 'Anonymous Citizen'
  },
  contactPhone: {
    type: String,
    default: null
  },
  imageUrl: {
    type: String,
    default: null
  },
  adminNotes: {
    type: String,
    default: ''
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

incidentSchema.index({ status: 1, urgencyLevel: 1, createdAt: -1 });

module.exports = mongoose.models.Incident || mongoose.model('Incident', incidentSchema);
