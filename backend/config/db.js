const mongoose = require('mongoose');
const config = require('./config');

let mongodInstance = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  try {
    // Attempt standard connection with 3-second timeout
    await mongoose.connect(config.MONGO_URI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[MongoDB] Connected to external/local instance at: ${config.MONGO_URI}`);
  } catch (err) {
    console.warn(`[MongoDB] Could not connect to ${config.MONGO_URI} (${err.message}). Starting embedded MongoMemoryServer...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const uri = mongodInstance.getUri();
      await mongoose.connect(uri);
      console.log(`[MongoDB] Connected to embedded in-memory MongoDB at: ${uri}`);
    } catch (memErr) {
      console.error('[MongoDB] Failed to initialize embedded database:', memErr.message);
      process.exit(1);
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] Connection error:', err.message);
  });
};

module.exports = connectDB;
