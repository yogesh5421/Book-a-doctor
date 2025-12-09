const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { body, validationResult } = require('express-validator');

// GET /api/doctors?search=&specialty=&page=&limit=
router.get('/', async (req, res) => {
  try {
    const { search, specialty, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (specialty) filter.specialty = { $regex: specialty, $options: 'i' };
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { specialty: { $regex: search, $options: 'i' } },
      { bio: { $regex: search, $options: 'i' } }
    ];
    const doctors = await Doctor.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// GET /api/doctors/:id
router.get('/:id', async (req, res) => {
  try {
    const doc = await Doctor.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ msg: 'Doctor not found' });
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// POST /api/doctors/   (admin or doctor can add)
router.post('/', auth, roleCheck(['admin','doctor']), [
  body('name').notEmpty(),
  body('specialty').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, specialty, bio, location } = req.body;
  try {
    const doctor = new Doctor({ name, specialty, bio, location, user: req.user.id });
    await doctor.save();
    res.json(doctor);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// PUT /api/doctors/:id  (edit)
router.put('/:id', auth, roleCheck(['admin','doctor']), async (req, res) => {
  try {
    const doc = await Doctor.findById(req.params.id);
    if (!doc) return res.status(404).json({ msg: 'Doctor not found' });
    // If the user is a doctor, allow only if they created it (optional). Skipping strict check for simplicity.
    const updates = req.body;
    Object.assign(doc, updates);
    await doc.save();
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// DELETE /api/doctors/:id   (admin only)
router.delete('/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Doctor removed' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;