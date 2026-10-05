/**
 * Port of evaluations/finalize.py's summarize_market, summarize_weather and
 * calculate_rule_engine. Kept as close as possible to the original pandas
 * logic, translated into plain JS array operations.
 */

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * history: array of { arrival_date, state, district, market, commodity,
 * min_price, max_price, modal_price, price_unit, ... }
 */
function summarizeMarket(history) {
  if (!history || history.length === 0) {
    return { available: false, message: "No market-price records found." };
  }

  // Keep only rows with a valid date and numeric modal_price.
  const cleaned = history
    .map((row) => ({
      ...row,
      modal_price: toNumber(row.modal_price),
      min_price: toNumber(row.min_price),
      max_price: toNumber(row.max_price),
    }))
    .filter((row) => row.arrival_date && row.modal_price !== null);

  // Sort ascending by date, then dedupe by date keeping the LAST occurrence
  // for that date (mirrors pandas drop_duplicates(keep="last") after sort).
  cleaned.sort((a, b) => (a.arrival_date < b.arrival_date ? -1 : a.arrival_date > b.arrival_date ? 1 : 0));

  const byDate = new Map();
  for (const row of cleaned) {
    byDate.set(row.arrival_date, row); // later rows for the same date overwrite earlier ones
  }
  const deduped = Array.from(byDate.values()).sort((a, b) =>
    a.arrival_date < b.arrival_date ? -1 : a.arrival_date > b.arrival_date ? 1 : 0
  );

  const df = deduped.slice(-7);

  if (df.length === 0) {
    return { available: false, message: "No valid market-price records found." };
  }

  const first = df[0];
  const latest = df[df.length - 1];
  const previous = df.length >= 2 ? df[df.length - 2] : null;

  const avgPrice = df.reduce((sum, r) => sum + r.modal_price, 0) / df.length;
  const firstPrice = first.modal_price;
  const latestPrice = latest.modal_price;

  const sevenDayChange = firstPrice !== 0 ? ((latestPrice - firstPrice) / firstPrice) * 100 : null;

  const previousPrice = previous ? previous.modal_price : null;
  const dayChange =
    previousPrice !== null && previousPrice !== 0 ? ((latestPrice - previousPrice) / previousPrice) * 100 : null;

  let trend;
  if (sevenDayChange === null || Math.abs(sevenDayChange) < 5) {
    trend = "stable";
  } else if (sevenDayChange > 0) {
    trend = "rising";
  } else {
    trend = "falling";
  }

  const recentPrices = df.map((row) => ({
    date: row.arrival_date,
    modal_price: row.modal_price,
  }));

  const round2 = (n) => (n === null || n === undefined ? null : Math.round(n * 100) / 100);

  return {
    available: true,
    source: "AGMARKNET / OGD India",
    state: String(latest.state || ""),
    district: String(latest.district || ""),
    market: String(latest.market || ""),
    crop: String(latest.commodity || ""),
    price_unit: String(latest.price_unit || "Rs./Quintal"),
    period: { from: first.arrival_date, to: latest.arrival_date },
    latest: {
      date: latest.arrival_date,
      min_price: latest.min_price,
      max_price: latest.max_price,
      modal_price: latestPrice,
    },
    seven_day_average_modal_price: round2(avgPrice),
    previous_day_modal_price: previousPrice,
    day_over_day_change_percent: round2(dayChange),
    seven_day_change_percent: round2(sevenDayChange),
    trend,
    recent_modal_prices: recentPrices,
  };
}

/**
 * weatherData: the raw JSON dict returned by OpenWeather /forecast
 * (or null/unavailable).
 */
function summarizeWeather(weatherData) {
  if (!weatherData || !["200", 200].includes(weatherData.cod)) {
    return { available: false, message: "Weather forecast is unavailable." };
  }

  const list = weatherData.list || [];
  if (list.length === 0) {
    return { available: false, message: "Weather forecast contains no entries." };
  }

  const byDate = new Map();

  for (const entry of list) {
    const dtTxt = entry.dt_txt;
    if (!dtTxt) continue;
    const date = dtTxt.slice(0, 10); // YYYY-MM-DD

    const temp = entry.main && typeof entry.main.temp === "number" ? entry.main.temp : null;
    if (temp === null) continue;

    const humidity = entry.main && typeof entry.main.humidity === "number" ? entry.main.humidity : null;
    const pop = toNumber(entry.pop) || 0;
    const rainProb = pop * 100;
    const condition =
      Array.isArray(entry.weather) && entry.weather.length > 0
        ? entry.weather[0].description || "unknown"
        : "unknown";

    if (!byDate.has(date)) {
      byDate.set(date, { date, temps: [], humidities: [], rainProbs: [], conditions: new Set() });
    }
    const bucket = byDate.get(date);
    bucket.temps.push(temp);
    if (humidity !== null) bucket.humidities.push(humidity);
    bucket.rainProbs.push(rainProb);
    bucket.conditions.add(condition);
  }

  const dates = Array.from(byDate.keys()); // insertion order == chronological order from API
  const dailyForecast = dates.slice(0, 5).map((date) => {
    const bucket = byDate.get(date);
    const round2 = (n) => Math.round(n * 100) / 100;
    const round0 = (n) => Math.round(n);
    const avgHumidity =
      bucket.humidities.length > 0
        ? bucket.humidities.reduce((s, h) => s + h, 0) / bucket.humidities.length
        : null;

    return {
      date,
      min_temp_c: round2(Math.min(...bucket.temps)),
      max_temp_c: round2(Math.max(...bucket.temps)),
      rain_probability_max_percent: round0(Math.max(...bucket.rainProbs)),
      conditions: Array.from(bucket.conditions).sort().join(", "),
      avg_humidity_percent: avgHumidity !== null ? round2(avgHumidity) : null,
    };
  });

  const city = weatherData.city || {};
  const coord = city.coord || {};

  return {
    available: true,
    source: "OpenWeather forecast",
    location: city.name || "Unknown",
    latitude: toNumber(coord.lat),
    longitude: toNumber(coord.lon),
    daily_forecast: dailyForecast,
  };
}

/**
 * market: output of summarizeMarket
 * weather: output of summarizeWeather
 * crop: crop knowledge base entry
 */
function calculateRuleEngine(market, weather, crop) {
  const facts = [];
  const reasons = [];

  const cropName = crop.crop_name || market.crop || "This crop";
  const latestPrice = market.latest ? market.latest.modal_price : undefined;
  const change = market.seven_day_change_percent;
  const trend = market.trend || "unknown";

  let maxForecastTemp = null;
  let maxRainProbability = 0;
  let minForecastTemp = null;

  if (weather.available) {
    const temps = (weather.daily_forecast || [])
      .map((d) => d.max_temp_c)
      .filter((t) => t !== null && t !== undefined);
    const rainProbs = (weather.daily_forecast || []).map((d) => d.rain_probability_max_percent || 0);
    const minTemps = (weather.daily_forecast || [])
      .map((d) => d.min_temp_c)
      .filter((t) => t !== null && t !== undefined);

    maxForecastTemp = temps.length > 0 ? Math.max(...temps) : null;
    maxRainProbability = rainProbs.length > 0 ? Math.max(...rainProbs) : 0;
    minForecastTemp = minTemps.length > 0 ? Math.min(...minTemps) : null;
  }

  const criticalMax = crop.critical_temp_max_c ?? null;
  const criticalMin = crop.critical_temp_min_c ?? null;
  const storageLife = crop.storage_life_days ?? null;
  const perishability = crop.perishability || "unknown";
  const sellBias = crop.sell_or_wait_bias || "";
  const heatSensitive = !!crop.heat_sensitive;
  const rainSensitive = !!crop.rain_sensitive;
  const waterloggingSensitive = !!crop.waterlogging_sensitive;

  const heatRisk = heatSensitive && maxForecastTemp !== null && criticalMax !== null && maxForecastTemp > criticalMax;

  const rainRisk = maxRainProbability >= 60 && (rainSensitive || waterloggingSensitive);

  const coldRisk = minForecastTemp !== null && criticalMin !== null && minForecastTemp < criticalMin;

  if (latestPrice !== undefined && latestPrice !== null) {
    facts.push(`Latest modal price is Rs.${Math.round(latestPrice)} per quintal.`);
  }

  if (change !== undefined && change !== null) {
    const sign = change >= 0 ? "+" : "";
    facts.push(`Seven-day price change is ${sign}${change.toFixed(2)}% and the trend is ${trend}.`);
  }

  if (heatRisk) {
    facts.push(
      `Maximum forecast temperature is ${maxForecastTemp.toFixed(1)}°C, above ${cropName}'s critical maximum of ${criticalMax.toFixed(1)}°C.`
    );
    reasons.push(`High temperature may reduce ${cropName} quality or yield.`);
  }

  if (coldRisk) {
    facts.push(
      `Minimum forecast temperature is ${minForecastTemp.toFixed(1)}°C, below ${cropName}'s critical minimum of ${criticalMin.toFixed(1)}°C.`
    );
    reasons.push(`Low temperature may damage ${cropName}.`);
  }

  if (rainRisk) {
    facts.push(`Maximum forecast rain probability is ${Math.round(maxRainProbability)}%.`);
    reasons.push(`Rain may increase harvest, transport, or storage risk for ${cropName}.`);
  }

  if (perishability === "high") {
    reasons.push(`${cropName} is highly perishable.`);
  } else if (perishability === "medium") {
    reasons.push(`${cropName} has moderate storage limitations.`);
  }

  let decision;
  if (heatRisk || coldRisk || rainRisk) {
    decision = "sell_within_1_to_3_days";
  } else if (sellBias === "sell_fast_if_perishable" && trend === "falling") {
    decision = "sell_soon";
  } else if (trend === "rising" && storageLife !== null && storageLife >= 7 && perishability !== "high") {
    decision = "monitor_for_1_day_before_selling";
  } else {
    decision = "sell_soon";
  }

  return {
    recommended_decision: decision,
    market_signal: trend,
    weather_risk: {
      heat_risk: heatRisk,
      cold_risk: coldRisk,
      rain_risk: rainRisk,
      max_forecast_temp_c: maxForecastTemp,
      min_forecast_temp_c: minForecastTemp,
      max_rain_probability_percent: maxRainProbability,
    },
    crop_storage_signal: perishability,
    facts_for_explanation: facts,
    reasons,
  };
}

module.exports = { summarizeMarket, summarizeWeather, calculateRuleEngine };
