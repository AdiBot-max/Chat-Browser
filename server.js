const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./auth");
const userRoutes = require("./users");
const messageRoutes = require("./messages");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/roblox-chat");

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/messages", messageRoutes);

// Serve React build
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Socket.IO
io.on("connection", (socket) => {
  socket.on("login", (username) => {
    socket.username = username;
    console.log(`${username} connected`);
  });

  socket.on("sendMessage", ({ from, to, message }) => {
    io.emit("receiveMessage", { from, to, message });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
