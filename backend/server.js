const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware parameters configuration
app.use(cors({ origin: '*' }));
app.use(express.json());

// Establish Connection directly to MongoDB instance
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/office_db')
  .then(() => console.log('MongoDB Infrastructure Linked Successfully.'))
  .catch(err => console.error('MongoDB database tracking failure:', err));

// ==================== DATABASE SCHEMAS & MODELS ====================

// 1. User Account Database Blueprint Matrix
const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true } // Storing plain text here for simplicity of setup
});
const User = mongoose.model('User', UserSchema);

// 2. Careers Job Board Database Blueprint Matrix
const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true }
});
const Job = mongoose.model('Job', JobSchema);

// ==================== RESTful API ROUTING ENDPOINTS ====================

// AUTHENTICATION: Account Sign Up Endpoint
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    
    // Check if configuration already matches existing users
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Email configuration already registered.' });
    }

    const newUser = new User({ fullName, email, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Internal pipeline sign up exception.' });
  }
});

// AUTHENTICATION: Account Login Authorization Validation Endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid authentication credentials matching record.' });
    }
    
    res.status(200).json({ message: 'Authorization verified.', user: { fullName: user.fullName, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Internal validation tracking exception.' });
  }
});

// CAREERS: Fetch All System Job Positions
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Database pipeline extraction error.' });
  }
});

// SEED ROUTE: Populates your database instantly with initial items
app.get('/api/jobs/seed', async (req, res) => {
  try {
    await Job.deleteMany({});
    const initialJobs = [
      { title: "Full-Stack Web Developer", department: "Engineering", location: "Berlin, DE / Remote", description: "Develop modern high-performance platforms using Vanilla JavaScript environments and custom architectures." },
      { title: "Automation Test Engineer", department: "Quality Assurance", location: "HQ Office / Hybrid", description: "Design responsive verification framework nodes to validate custom user workflows and code integrity." },
      { title: "Cloud Systems Architect", department: "Infrastructure", location: "Remote (Global)", description: "Manage deployment instances, configure automated monitoring pipelines, and oversee active server clusters." }
    ];
    await Job.insertMany(initialJobs);
    res.status(201).json({ message: "Job records seeded into MongoDB cluster setup successfully!" });
  } catch (err) {
    res.status(500).json({ error: 'Database seeding failed.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Ecosystem Server operating at http://localhost:${PORT}`));
