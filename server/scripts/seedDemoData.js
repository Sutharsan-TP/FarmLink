/**
 * Seeds demo data into the database on every boot when running against the
 * in-memory MongoDB (see src/config/db.js). Not used against a real MONGODB_URI.
 *
 * Seeds:
 *  - two demo accounts (Farmer + Admin) with known credentials, printed to the
 *    console on startup so they're easy to log in with from the mobile app.
 *  - the real migrated mandi price history (scripts/mandi_market_data.json,
 *    produced by export_sqlite_to_json.py from the original SQLite data) if
 *    present, so /api/market and /api/advisory have real data to work with.
 */

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const User = require("../src/models/User");
const MandiMarketData = require("../src/models/MandiMarketData");

const DEMO_USERS = [
  { name: "Demo Farmer", email: "farmer@farmsafe.demo", password: "Farmer123!", role: "Farmer" },
  { name: "Demo Admin", email: "admin@farmsafe.demo", password: "Admin123!", role: "Admin" },
];

async function seedUsers() {
  for (const demo of DEMO_USERS) {
    const existing = await User.findOne({ email: demo.email });
    if (existing) continue;
    const passwordHash = await bcrypt.hash(demo.password, 10);
    await User.create({
      name: demo.name,
      email: demo.email,
      passwordHash,
      role: demo.role,
    });
  }
}

async function seedMarketData() {
  const count = await MandiMarketData.countDocuments();
  if (count > 0) return;

  const jsonPath = path.join(__dirname, "mandi_market_data.json");
  if (!fs.existsSync(jsonPath)) {
    console.log("No scripts/mandi_market_data.json found — skipping market data seed.");
    return;
  }

  const rows = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  await MandiMarketData.insertMany(rows, { ordered: false });
  console.log(`Seeded ${rows.length} mandi price rows into the in-memory database.`);
}

async function seedDemoData() {
  await seedUsers();
  await seedMarketData();
}

module.exports = seedDemoData;
