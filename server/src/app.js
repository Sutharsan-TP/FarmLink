const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const marketRoutes = require("./routes/marketRoutes");
const advisoryRoutes = require("./routes/advisoryRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to FarmSafe Backend" });
});

app.get("/health", (req, res) => {
  res.json({ status: "Running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/advisory", advisoryRoutes);
app.use("/api/admin", adminRoutes);

module.exports = app;
