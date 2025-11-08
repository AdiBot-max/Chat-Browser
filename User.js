const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  friends: [String],
  requests: [String]
});

module.exports = mongoose.model("User", userSchema);
