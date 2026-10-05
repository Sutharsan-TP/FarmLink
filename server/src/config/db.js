const mongoose = require("mongoose");

let memoryServer = null;

/**
 * Connects to MongoDB. If MONGODB_URI is unset (or explicitly set to "memory"),
 * spins up an ephemeral in-memory MongoDB instead, so the API runs with zero
 * external setup for demos/dev. Data seeded into it does not persist across
 * restarts — see scripts/seedDemoData.js, which runs automatically in that mode.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri === "memory") {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    memoryServer = await MongoMemoryServer.create();
    const memoryUri = memoryServer.getUri("farmsafe");
    await mongoose.connect(memoryUri);
    console.log("Connected to an in-memory MongoDB instance (no external MongoDB needed).");
    console.log("Data here is temporary and resets every time the server restarts.");

    const seedDemoData = require("../../scripts/seedDemoData");
    await seedDemoData();
    return;
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
