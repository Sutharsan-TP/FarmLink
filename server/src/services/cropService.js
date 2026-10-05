const fs = require("fs");
const path = require("path");

const CROP_KB_PATH = path.join(__dirname, "..", "..", "data", "crop_knowledge_base.json");

let cache = null;

function loadCropKnowledgeBase() {
  if (!cache) {
    const raw = fs.readFileSync(CROP_KB_PATH, "utf-8");
    cache = JSON.parse(raw);
  }
  return cache;
}

/**
 * Mirrors evaluations/finalize.py::get_crop_knowledge. Returns null
 * (instead of throwing a KeyError, as the original did) when the crop
 * isn't in the knowledge base, so the caller can respond 404 gracefully.
 */
function getCropKnowledge(commodity) {
  const data = loadCropKnowledgeBase();
  return data[String(commodity).toLowerCase()] || null;
}

module.exports = { getCropKnowledge };
