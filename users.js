const express = require("express");
const router = express.Router();
const User = require("./User");

// Send friend request
router.post("/request", async (req, res) => {
  const { from, to } = req.body;
  const userTo = await User.findOne({ username: to });
  if (!userTo) return res.status(400).json({ error: "User not found" });
  if (userTo.requests.includes(from)) return res.status(400).json({ error: "Request already sent" });

  userTo.requests.push(from);
  await userTo.save();
  res.json({ success: true });
});

// Accept request
router.post("/accept", async (req, res) => {
  const { from, to } = req.body;
  const user = await User.findOne({ username: to });
  const requester = await User.findOne({ username: from });

  if (!user || !requester) return res.status(400).json({ error: "User not found" });
  if (!user.requests.includes(from)) return res.status(400).json({ error: "No such request" });

  user.requests = user.requests.filter(r => r !== from);
  user.friends.push(from);
  requester.friends.push(to);

  await user.save();
  await requester.save();
  res.json({ success: true });
});

// Get friends & requests
router.get("/friends/:username", async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) return res.status(400).json({ error: "User not found" });
  res.json({ friends: user.friends, requests: user.requests });
});

module.exports = router;
