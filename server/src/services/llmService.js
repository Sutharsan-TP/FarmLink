/**
 * Port of evaluations/model.py::call_gemma's prompt + request shape,
 * minus the payload prep (that's done by the caller via makeFastPayload).
 */

function safeRound(value, digits = 0) {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const factor = 10 ** digits;
  return Math.round(n * factor) / factor;
}

/**
 * Mirrors evaluations/finalize.py::make_fast_payload.
 */
function makeFastPayload({ market, weather, crop, rules, farmer }) {
  return {
    lang: farmer.language,
    crop: farmer.crop,
    market: farmer.market,
    district: farmer.district,
    decision: rules.recommended_decision,
    price: safeRound(market.latest ? market.latest.modal_price : null),
    chg7d_pct: safeRound(market.seven_day_change_percent, 1),
    trend: market.trend,
    max_temp_c: safeRound(rules.weather_risk ? rules.weather_risk.max_forecast_temp_c : null),
    heat_risk: rules.weather_risk ? rules.weather_risk.heat_risk : null,
    rain_risk: rules.weather_risk ? rules.weather_risk.rain_risk : null,
    perishable: crop.perishability,
    storage_days: crop.storage_life_days,
    crit_temp_c: crop.critical_temp_max_c,
    reasons: rules.reasons || [],
  };
}

/**
 * Mirrors evaluations/finalize.py::payload_to_prompt.
 */
function payloadToPrompt(p) {
  return (
    `Crop:${p.crop} Market:${p.market},${p.district} Lang:${p.lang}\n` +
    `Price:${p.price}/quintal Chg7d:${p.chg7d_pct}% Trend:${p.trend}\n` +
    `MaxTemp:${p.max_temp_c}C HeatRisk:${p.heat_risk} RainRisk:${p.rain_risk}\n` +
    `Perishable:${p.perishable} StorageDays:${p.storage_days} CritTemp:${p.crit_temp_c}\n` +
    `Reasons:${(p.reasons || []).join("; ")}\n` +
    `Decision so far:${p.decision}`
  );
}

/**
 * Mirrors evaluations/model.py::call_gemma's LLM call.
 */
async function callGemma(fastPayload, language = "Telugu") {
  const payloadText = payloadToPrompt(fastPayload);

  const systemPrompt = `
    You are Mandi Mitra, an agricultural advisory assistant.

    Always respond only in ${language}.
    Always format your response using Markdown.
    Use only the verified context provided.
    Do not invent facts.
    Do not predict future prices.
    The recommended_decision is authoritative and must not be changed.
    `;

  const userPrompt = `
    Write the farmer advisory in **${language}** language using **Markdown**.

    Use this exact format:

    ## Recommendation

    (One short paragraph)

    ## Why
    - Reason 1
    - Reason 2
    - Reason 3

    ## Actions
    1. Action 1
    2. Action 2
    3. Action 3

    ## Caution

    One short caution.

    Rules:
    - Use Markdown only.
    - Do not return HTML.
    - Do not return JSON.
    - Keep the response under 150 words.
    - Use only the verified context below.

    VERIFIED CONTEXT:
    ${payloadText}
    `;

  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1";
  const model = process.env.OLLAMA_MODEL || "gemma4:e2b-it-q4_K_M";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama responded with status ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

module.exports = { makeFastPayload, payloadToPrompt, callGemma };
