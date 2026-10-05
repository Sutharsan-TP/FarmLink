/**
 * One-off migration helper: reads server/scripts/mandi_market_data.json
 * (produced by export_sqlite_to_json.py) and bulk-upserts it into the
 * MandiMarketData collection, keyed on the same composite key the
 * original SQLite table used.
 *
 * Usage:
 *   npm run seed
 * (requires MONGODB_URI to be set, e.g. via a .env file in server/)
 */

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const MandiMarketData = require("../src/models/MandiMarketData");

const JSON_PATH = path.join(__dirname, "mandi_market_data.json");

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Copy server/.env.example to server/.env and configure it.");
  }

  if (!fs.existsSync(JSON_PATH)) {
    throw new Error(
      `Could not find ${JSON_PATH}. Run "python server/scripts/export_sqlite_to_json.py" first.`
    );
  }

  const rows = JSON.parse(fs.readFileSync(JSON_PATH, "utf-8"));
  console.log(`Loaded ${rows.length} rows from ${JSON_PATH}`);

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const operations = rows.map((row) => ({
    updateOne: {
      filter: {
        arrival_date: row.arrival_date,
        state: row.state,
        district: row.district,
        market: row.market,
        commodity: row.commodity,
        variety: row.variety,
        grade: row.grade,
      },
      update: { $set: row },
      upsert: true,
    },
  }));

  const BATCH_SIZE = 1000;
  let upserted = 0;

  for (let i = 0; i < operations.length; i += BATCH_SIZE) {
    const batch = operations.slice(i, i + BATCH_SIZE);
    const result = await MandiMarketData.bulkWrite(batch, { ordered: false });
    upserted += (result.upsertedCount || 0) + (result.modifiedCount || 0);
    console.log(`Processed ${Math.min(i + BATCH_SIZE, operations.length)}/${operations.length}`);
  }

  console.log(`Done. Upserted/updated approximately ${upserted} documents.`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
