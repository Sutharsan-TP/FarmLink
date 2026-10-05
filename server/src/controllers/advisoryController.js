const { fetchHistoricalPrices } = require("../services/marketService");
const { getCropKnowledge } = require("../services/cropService");
const { fetchWeatherData } = require("../services/weatherService");
const { summarizeMarket, summarizeWeather, calculateRuleEngine } = require("../services/finalizeService");
const { makeFastPayload, callGemma } = require("../services/llmService");

const TREND_LABELS = { rising: "Increasing", falling: "Decreasing", stable: "Stable" };

const BEST_SELLING_PERIOD_LABELS = {
  sell_within_1_to_3_days: "Within 1-3 Days",
  sell_soon: "This Week",
  monitor_for_1_day_before_selling: "Monitor 1 Day, Then Sell",
};

function buildHarvestTip(crop) {
  return `Harvest within ${crop.harvest_window_days} days of optimal maturity.`;
}

function buildStorageTip(crop) {
  if (crop.storage_temp_range_c) {
    const [lo, hi] = crop.storage_temp_range_c;
    return `Can be stored for ${crop.storage_life_days} days (ideal ${lo}–${hi}°C).`;
  }

  if (crop.storage_temp_by_use_c) {
    const byUse = crop.storage_temp_by_use_c;
    const range = byUse.table_fresh || byUse[Object.keys(byUse)[0]];
    if (range) {
      const [lo, hi] = range;
      return `Can be stored for ${crop.storage_life_days} days (ideal ${lo}–${hi}°C).`;
    }
  }

  return `Can be stored for ${crop.storage_life_days} days.`;
}

function computeRiskLevel(risks, market, crop) {
  if (risks.heat_risk || risks.cold_risk || risks.rain_risk) return "High";
  if (market.trend === "falling" && (crop.perishability === "high" || crop.perishability === "medium")) {
    return "Medium";
  }
  return "Low";
}

function computeConfidence(marketAvailable, risks, weatherAvailable) {
  let confidence = 90;
  if (!marketAvailable) confidence -= 15;

  const riskCount = [risks.heat_risk, risks.cold_risk, risks.rain_risk].filter(Boolean).length;
  confidence -= Math.min(riskCount * 10, 30);

  if (!weatherAvailable) confidence -= 5;

  return Math.max(40, Math.min(95, confidence));
}

async function getAdvisory(req, res) {
  try {
    const body = req.body || {};
    const commodity = body.crop || "Tomato";
    const state = body.state || "Andhra Pradesh";
    const district = body.district || "Palamaner";
    const market = body.market || "Palamaner APMC";
    const latitude = body.latitude !== undefined ? parseFloat(body.latitude) : 13.55204;
    const longitude = body.longitude !== undefined ? parseFloat(body.longitude) : 78.505798;
    const language = body.language || "Telugu";

    const crop = getCropKnowledge(commodity);
    if (!crop) {
      return res.status(404).json({ success: false, message: "Unsupported crop" });
    }

    const historicPrices = await fetchHistoricalPrices({ commodity, state, district, market, days: 7 });
    const marketSummary = summarizeMarket(historicPrices);

    let weatherData = null;
    try {
      weatherData = await fetchWeatherData(latitude, longitude);
    } catch (err) {
      weatherData = null;
    }
    const weatherSummary = summarizeWeather(weatherData);

    const rules = calculateRuleEngine(marketSummary, weatherSummary, crop);

    const risks = rules.weather_risk;
    const riskLevel = computeRiskLevel(risks, marketSummary, crop);
    const confidence = computeConfidence(marketSummary.available, risks, weatherSummary.available);

    const fastPayload = makeFastPayload({
      market: marketSummary,
      weather: weatherSummary,
      crop,
      rules,
      farmer: { language, state, district, market, crop: commodity },
    });

    let recommendation;
    try {
      recommendation = await callGemma(fastPayload, language);
    } catch (err) {
      recommendation = `Unable to generate advisory right now: ${err.message}`;
    }

    const firstDay = weatherSummary.available ? weatherSummary.daily_forecast[0] : null;

    const weatherPayload = firstDay
      ? {
          temperature: `${firstDay.max_temp_c}°C`,
          humidity: firstDay.avg_humidity_percent !== null ? `${firstDay.avg_humidity_percent}%` : "N/A",
          rainfall: `${firstDay.rain_probability_max_percent}%`,
        }
      : { temperature: "N/A", humidity: "N/A", rainfall: "N/A" };

    const marketPayload = marketSummary.available
      ? {
          market_name: market,
          current_price: marketSummary.latest.modal_price,
          modal_price: marketSummary.latest.modal_price,
          max_price: marketSummary.latest.max_price,
          min_price: marketSummary.latest.min_price,
          trend: TREND_LABELS[marketSummary.trend] || "Stable",
        }
      : {
          market_name: market,
          current_price: "N/A",
          modal_price: "N/A",
          max_price: "N/A",
          min_price: "N/A",
          trend: TREND_LABELS[marketSummary.trend] || "Stable",
        };

    const cropPayload = {
      harvest_tip: buildHarvestTip(crop),
      storage_tip: buildStorageTip(crop),
      best_selling_period: BEST_SELLING_PERIOD_LABELS[rules.recommended_decision] || "This Week",
    };

    return res.status(200).json({
      weather: weatherPayload,
      market: marketPayload,
      crop: cropPayload,
      recommendation,
      confidence,
      risk_level: riskLevel,
      decision: rules.recommended_decision,
      reasons: rules.reasons,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to generate advisory" });
  }
}

module.exports = { getAdvisory };
