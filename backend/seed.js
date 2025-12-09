// quick seed: create admin user and some doctors
const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const bcrypt = require('bcryptjs');

const seed = async () => {
  await connectDB();
  try {
    // clear
    await User.deleteMany({});
    await Doctor.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('admin123', salt);
    const admin = new User({ name: 'Admin', email: 'admin@docspot.com', password: adminPass, role: 'admin' });
    await admin.save();

    const doc1 = new Doctor({ name: 'Dr. Anya Sharma', specialty: 'Cardiology', bio: 'Cardiologist with 10 years experience' });
    const doc2 = new Doctor({ name: 'Dr. Ben Carter', specialty: 'Dermatology', bio: 'Skin specialist' });
    const doc3 = new Doctor({ name: 'Dr. Ben Sharma', specialty: 'Pediatrics', bio: 'Children specialist' });
    await Doctor.insertMany([doc1, doc2, doc3]);

    console.log('Seed completed. Admin login: admin@docspot.com / admin123');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
