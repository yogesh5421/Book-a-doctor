const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['booked','cancelled','completed'], default: 'booked' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// optional compound index to help detect conflicts
AppointmentSchema.index({ doctor: 1, date: 1 }, { unique: false });

module.exports = mongoose.model('Appointment', AppointmentSchema);