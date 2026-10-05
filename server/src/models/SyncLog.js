const mongoose = require("mongoose");

const syncLogSchema = new mongoose.Schema(
  {
    syncedAt: { type: String, required: true },
    recordsAdded: { type: Number, required: true },
  },
  { versionKey: false }
);

module.exports = mongoose.model("SyncLog", syncLogSchema);
