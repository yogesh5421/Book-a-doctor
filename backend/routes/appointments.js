const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// POST /api/appointments  - book (patient)
router.post('/', auth, roleCheck(['patient','admin']), [
  body('doctorId').notEmpty().custom(v => mongoose.Types.ObjectId.isValid(v)),
  body('date').notEmpty().isISO8601()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { doctorId, date, notes } = req.body;
    const doc = await Doctor.findById(doctorId);
    if (!doc) return res.status(404).json({ msg: 'Doctor not found' });

    // simple clash prevention: same doctor same exact date/time
    const existing = await Appointment.findOne({ doctor: doctorId, date: new Date(date), status: 'booked' });
    if (existing) return res.status(400).json({ msg: 'This slot is already booked' });

    const appt = new Appointment({
      patient: req.user.id,
      doctor: doctorId,
      date: new Date(date),
      notes
    });
    await appt.save();
    res.json(appt);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// GET /api/appointments/me  - patient own appointments
router.get('/me', auth, roleCheck(['patient','admin']), async (req, res) => {
  try {
    const appts = await Appointment.find({ patient: req.user.id }).populate('doctor').sort({ date: 1 });
    res.json(appts);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// GET /api/appointments/doctor  - for doctor to view bookings
router.get('/doctor/me', auth, roleCheck(['doctor','admin']), async (req, res) => {
  try {
    // We'll find doctor by linked user or by query param - for simplicity assume doctor.user == req.user.id
    const doc = await Doctor.findOne({ user: req.user.id });
    if (!doc) return res.status(404).json({ msg: 'Doctor profile not found for this user' });
    const appts = await Appointment.find({ doctor: doc._id }).populate('patient').sort({ date: 1 });
    res.json(appts);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// PUT /api/appointments/:id/cancel   - patient or admin
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ msg: 'Appointment not found' });

    // Only patient who booked it or admin can cancel
    if (req.user.role !== 'admin' && appt.patient.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    appt.status = 'cancelled';
    await appt.save();
    res.json(appt);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// PUT /api/appointments/:id/complete  - doctor or admin
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ msg: 'Appointment not found' });

    // Only doctor of appointment or admin can mark complete
    const doc = await Doctor.findOne({ user: req.user.id });
    if (req.user.role !== 'admin' && (!doc || doc._id.toString() !== appt.doctor.toString())) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    appt.status = 'completed';
    await appt.save();
    res.json(appt);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Admin: list all appointments (optional)
router.get('/', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const appts = await Appointment.find().populate('patient').populate('doctor').sort({ date: -1 });
    res.json(appts);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;