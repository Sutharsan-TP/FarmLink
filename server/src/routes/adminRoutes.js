const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const { syncPrices, syncStatus } = require("../controllers/adminController");

const router = express.Router();

router.use(requireAuth, requireRole("Admin"));

router.post("/sync-prices", syncPrices);
router.get("/sync-status", syncStatus);

module.exports = router;
