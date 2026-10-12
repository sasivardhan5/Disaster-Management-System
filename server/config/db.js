const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('[DisasterGuard DB] MONGODB_URI not configured in .env.');
    console.log('[DisasterGuard DB] Initializing Local Demonstration Storage Mode (Persistent JSON Store).');
    return false;
  }

  try {
    console.log(`[DisasterGuard DB] Attempting MongoDB connection at ${uri}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Quick timeout to prevent blocking if Mongo is offline
      autoIndex: true
    });
    isConnected = true;
    console.log('[DisasterGuard DB] Connected successfully to MongoDB.');
    return true;
  } catch (err) {
    console.warn(`[DisasterGuard DB] MongoDB connection failed (${err.message}).`);
    console.log('[DisasterGuard DB] Falling back automatically to Local Demonstration Storage Mode.');
    isConnected = false;
    return false;
  }
}

function getDBStatus() {
  return isConnected;
}

module.exports = {
  connectDB,
  getDBStatus
};
