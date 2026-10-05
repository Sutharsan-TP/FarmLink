const { getMarketData, getMarketHistory } = require("../services/marketService");

async function market(req, res) {
  const { state, district, market: marketName, crop } = req.query;

  if (!state || !district || !marketName || !crop) {
    return res.status(400).json({ message: "state, district, market and crop are all required" });
  }

  const result = await getMarketData(state, district, marketName, crop);
  return res.json(result);
}

async function marketHistory(req, res) {
  const { state, district, market: marketName, crop } = req.query;
  let { limit } = req.query;

  if (!state || !district || !marketName || !crop) {
    return res.status(400).json({ message: "state, district, market and crop are all required" });
  }

  limit = limit !== undefined ? parseInt(limit, 10) : 30;
  if (Number.isNaN(limit)) limit = 30;
  if (limit > 90) {
    return res.status(400).json({ message: "limit must be 90 or less" });
  }

  const result = await getMarketHistory(state, district, marketName, crop, limit);
  return res.json(result);
}

module.exports = { market, marketHistory };
