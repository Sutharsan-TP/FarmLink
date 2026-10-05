const express = require("express");
const { market, marketHistory } = require("../controllers/marketController");

const router = express.Router();

router.get("/", market);
router.get("/history", marketHistory);

module.exports = router;
