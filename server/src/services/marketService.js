const MandiMarketData = require("../models/MandiMarketData");
const SyncLog = require("../models/SyncLog");

/**
 * Most recent row for a state/district/market/commodity combination.
 * Mirrors app/services/market_service.py::get_market_data.
 */
async function getMarketData(state, district, market, crop) {
  const row = await MandiMarketData.findOne({ state, district, market, commodity: crop })
    .sort({ arrival_date: -1 })
    .lean();

  if (row) {
    const { _id, ...rest } = row;
    return rest;
  }

  return { message: "No market data found" };
}

/**
 * Max/modal/min price history, ordered oldest -> newest.
 * Mirrors app/services/market_service.py::get_market_history.
 */
async function getMarketHistory(state, district, market, crop, limit = 30) {
  const rows = await MandiMarketData.find({ state, district, market, commodity: crop })
    .sort({ arrival_date: -1 })
    .limit(limit)
    .lean();

  rows.reverse();

  return rows.map((row) => ({
    date: row.arrival_date,
    maxPrice: row.max_price,
    modalPrice: row.modal_price,
    minPrice: row.min_price,
  }));
}

/**
 * Fetch the latest N distinct reporting dates for a commodity/location,
 * then return every row on those dates, sorted oldest -> newest.
 * Mirrors evaluations/agmarknet_api.py::fetch_historical_prices.
 */
async function fetchHistoricalPrices({ commodity, state, district, market, days = 7 }) {
  const match = { commodity };
  if (state) match.state = state;
  if (district) match.district = district;
  if (market) match.market = market;

  const dateDocs = await MandiMarketData.aggregate([
    { $match: match },
    { $group: { _id: "$arrival_date" } },
    { $sort: { _id: -1 } },
    { $limit: days },
  ]);

  const dates = dateDocs.map((d) => d._id);
  if (dates.length === 0) return [];

  const rows = await MandiMarketData.find({ ...match, arrival_date: { $in: dates } })
    .sort({ arrival_date: 1, market: 1, variety: 1 })
    .lean();

  return rows;
}

/**
 * Simulated daily sync. Mirrors app/services/market_service.py::sync_daily_prices
 * exactly (same random-fluctuation algorithm), since no live government price
 * API is wired up in the original project either.
 */
async function syncDailyPrices() {
  const today = new Date().toISOString().slice(0, 10);

  const latestRows = await MandiMarketData.aggregate([
    {
      $group: {
        _id: { state: "$state", district: "$district", market: "$market", commodity: "$commodity" },
        latestDate: { $max: "$arrival_date" },
      },
    },
  ]);

  let added = 0;
  const toInsert = [];

  for (const group of latestRows) {
    const { state, district, market, commodity } = group._id;
    const latestDate = group.latestDate;

    const alreadySynced = await MandiMarketData.findOne({
      state,
      district,
      market,
      commodity,
      arrival_date: today,
    }).lean();
    if (alreadySynced) continue;

    const row = await MandiMarketData.findOne({
      state,
      district,
      market,
      commodity,
      arrival_date: latestDate,
    }).lean();
    if (!row) continue;

    const roundTo10 = (n) => Math.round(n / 10) * 10;

    const baseModal = row.modal_price || 1000;
    const fluctuation = Math.random() * (0.05 - -0.04) + -0.04; // [-0.04, 0.05)
    const modalPrice = roundTo10(baseModal * (1 + fluctuation));
    const minPrice = roundTo10(modalPrice * (Math.random() * (0.93 - 0.85) + 0.85));
    const maxPrice = roundTo10(modalPrice * (Math.random() * (1.15 - 1.07) + 1.07));
    const baseQty = row.arrival_quantity || 1.0;
    const arrivalQuantity = Math.round(Math.max(baseQty * (Math.random() * (1.2 - 0.8) + 0.8), 0.1) * 10) / 10;

    toInsert.push({
      state: row.state,
      district: row.district,
      market: row.market,
      commodity_group: row.commodity_group,
      commodity: row.commodity,
      variety: row.variety,
      grade: row.grade,
      min_price: minPrice,
      max_price: maxPrice,
      modal_price: modalPrice,
      price_unit: row.price_unit,
      arrival_quantity: arrivalQuantity,
      arrival_unit: row.arrival_unit,
      arrival_date: today,
    });
    added += 1;
  }

  if (toInsert.length > 0) {
    await MandiMarketData.insertMany(toInsert, { ordered: false });
  }

  const syncedAt = new Date().toISOString();
  await SyncLog.create({ syncedAt, recordsAdded: added });

  return {
    success: true,
    syncedAt,
    recordsAdded: added,
    message:
      added > 0
        ? `Synced ${added} new price record(s) for ${today}.`
        : `All markets already up to date for ${today}.`,
  };
}

/**
 * Mirrors app/services/market_service.py::get_sync_status.
 */
async function getSyncStatus() {
  const last = await SyncLog.findOne().sort({ _id: -1 }).lean();
  const totalRecords = await MandiMarketData.countDocuments();

  return {
    lastSyncedAt: last ? last.syncedAt : null,
    lastRecordsAdded: last ? last.recordsAdded : 0,
    totalRecords,
  };
}

module.exports = {
  getMarketData,
  getMarketHistory,
  fetchHistoricalPrices,
  syncDailyPrices,
  getSyncStatus,
};
