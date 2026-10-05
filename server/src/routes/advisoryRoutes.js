const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { getAdvisory } = require("../controllers/advisoryController");

const router = express.Router();

router.post("/", requireAuth, getAdvisory);

module.exports = router;
