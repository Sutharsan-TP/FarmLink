const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

function toPublicUser(user) {
  return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
}

async function register(req, res) {
  try {
    const { name, email, password, role } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "email and password are required" });
    }

    const normalizedRole = role === "Admin" ? "Admin" : "Farmer";
    const normalizedEmail = String(email).toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ success: false, message: "A user with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role: normalizedRole,
    });

    const token = signToken(user);

    return res.status(201).json({
      success: true,
      message: "Registration Successful",
      user: toPublicUser(user),
      token,
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ success: false, message: "A user with this email already exists" });
    }
    console.error(err);
    return res.status(500).json({ success: false, message: "Registration failed" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = signToken(user);

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      user: toPublicUser(user),
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
}

module.exports = { register, login };
