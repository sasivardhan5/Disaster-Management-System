require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { connectDB } = require('../config/db');
const { seedUsers, seedAlerts, seedIncidents, seedShelters, seedHospitals, seedEmergencyServices } = require('./seedData');

const User = require('../models/User');
const Alert = require('../models/Alert');
const Incident = require('../models/Incident');
const Shelter = require('../models/Shelter');

async function runSeed() {
  console.log('--- DisasterGuard Seed Script ---');
  
  // 1. Reset JSON files
  const jsonDir = path.join(__dirname, 'json');
  if (!fs.existsSync(jsonDir)) {
    fs.mkdirSync(jsonDir, { recursive: true });
  }

  fs.writeFileSync(path.join(jsonDir, 'users.json'), JSON.stringify(seedUsers, null, 2));
  fs.writeFileSync(path.join(jsonDir, 'alerts.json'), JSON.stringify(seedAlerts, null, 2));
  fs.writeFileSync(path.join(jsonDir, 'incidents.json'), JSON.stringify(seedIncidents, null, 2));
  fs.writeFileSync(path.join(jsonDir, 'shelters.json'), JSON.stringify(seedShelters, null, 2));
  fs.writeFileSync(path.join(jsonDir, 'hospitals.json'), JSON.stringify(seedHospitals, null, 2));
  fs.writeFileSync(path.join(jsonDir, 'emergencyServices.json'), JSON.stringify(seedEmergencyServices, null, 2));
  console.log('✓ Successfully reset JSON demo files in server/data/json/');

  // 2. If MongoDB is available, seed MongoDB too
  if (process.env.MONGODB_URI) {
    const connected = await connectDB();
    if (connected) {
      await User.deleteMany({});
      await Alert.deleteMany({});
      await Incident.deleteMany({});
      await Shelter.deleteMany({});

      await User.insertMany(seedUsers);
      await Alert.insertMany(seedAlerts);
      await Incident.insertMany(seedIncidents);
      await Shelter.insertMany(seedShelters);
      console.log('✓ Successfully seeded MongoDB collections!');
    }
  }

  console.log('Demo data initialization finished.');
  process.exit(0);
}

runSeed().catch(err => {
  console.error('Seed script error:', err);
  process.exit(1);
});
