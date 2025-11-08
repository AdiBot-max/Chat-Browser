const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./User");

const SECRET = process.env.JWT_SECRET || "roblox-chat-secret";

// Signup
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Missing fields" });
  const exist = await User.findOne({ username });
  if (exist) return res.status(400).json({ error: "Username exists" });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ username, password: hashed, friends: [], requests: [] });
  const token = jwt.sign({ id: user._id }, SECRET);
  res.json({ token, username: user.username });
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Wrong password" });

  const token = jwt.sign({ id: user._id }, SECRET);
  res.json({ token, username: user.username });
});

module.exports = router;
