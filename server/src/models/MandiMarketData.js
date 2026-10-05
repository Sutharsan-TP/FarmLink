const mongoose = require("mongoose");

const mandiMarketDataSchema = new mongoose.Schema(
  {
    state: { type: String, required: true },
    district: { type: String, required: true },
    market: { type: String, required: true },
    commodity_group: { type: String },
    commodity: { type: String, required: true },
    variety: { type: String },
    grade: { type: String },
    min_price: { type: Number },
    max_price: { type: Number },
    modal_price: { type: Number },
    price_unit: { type: String },
    arrival_quantity: { type: Number },
    arrival_unit: { type: String },
    // Kept as a String in YYYY-MM-DD form (not a Date) to match the
    // original SQLite schema's sorting/filtering behaviour exactly.
    arrival_date: { type: String, required: true },
  },
  { versionKey: false }
);

mandiMarketDataSchema.index(
  { arrival_date: 1, state: 1, district: 1, market: 1, commodity: 1, variety: 1, grade: 1 },
  { unique: true }
);

module.exports = mongoose.model("MandiMarketData", mandiMarketDataSchema);
