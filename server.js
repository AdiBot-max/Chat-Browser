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
const User = require("./User");
const Message = require("./Message");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// MongoDB connect
mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/roblox-chat");

// Express routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/messages", messageRoutes);

// Serve built React app
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Socket.IO realtime system
const onlineUsers = new Map(); // username → socket.id

io.on("connection", (socket) => {
  console.log("🟢 New connection:", socket.id);

  socket.on("login", (username) => {
    onlineUsers.set(username, socket.id);
    socket.username = username;
    console.log(`✅ ${username} connected`);
  });

  // 🔹 Friend request system
  socket.on("sendRequest", async ({ from, to }) => {
    try {
      const receiver = await User.findOne({ username: to });
      if (!receiver) {
        socket.emit("alert", "User not found");
        return;
      }

      if (!receiver.requests.includes(from)) {
        receiver.requests.push(from);
        await receiver.save();
      }

      socket.emit("alert", `Friend request sent to ${to}`);

      const targetSocket = onlineUsers.get(to);
      if (targetSocket) {
        io.to(targetSocket).emit("newRequest", from);
      }
    } catch (err) {
      console.error("❌ sendRequest error:", err);
    }
  });

  socket.on("acceptRequest", async ({ from, to }) => {
    try {
      const receiver = await User.findOne({ username: to });
      const sender = await User.findOne({ username: from });
      if (!receiver || !sender) return;

      if (!receiver.friends.includes(from)) receiver.friends.push(from);
      if (!sender.friends.includes(to)) sender.friends.push(to);
      receiver.requests = receiver.requests.filter((r) => r !== from);

      await receiver.save();
      await sender.save();

      socket.emit("alert", `You and ${from} are now friends!`);
      const senderSocket = onlineUsers.get(from);
      if (senderSocket) io.to(senderSocket).emit("friendAdded", to);
    } catch (err) {
      console.error("❌ acceptRequest error:", err);
    }
  });

  // 🔹 Messaging system
  socket.on("sendMessage", async ({ from, to, text }) => {
    try {
      if (!from || !to || !text.trim()) return;
      const msg = new Message({ from, to, text, timestamp: new Date() });
      await msg.save();

      // deliver to both sender and receiver live
      socket.emit("receiveMessage", msg);
      const targetSocket = onlineUsers.get(to);
      if (targetSocket) io.to(targetSocket).emit("receiveMessage", msg);
    } catch (err) {
      console.error("❌ sendMessage error:", err);
      socket.emit("alert", "Message failed");
    }
  });

  socket.on("disconnect", () => {
    if (socket.username) onlineUsers.delete(socket.username);
    console.log(`🔴 ${socket.username || socket.id} disconnected`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
