const { syncDailyPrices, getSyncStatus } = require("../services/marketService");

async function syncPrices(req, res) {
  const result = await syncDailyPrices();
  return res.json(result);
}

async function syncStatus(req, res) {
  const result = await getSyncStatus();
  return res.json(result);
}

module.exports = { syncPrices, syncStatus };
