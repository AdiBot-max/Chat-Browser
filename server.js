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
  console.log("New connection:", socket.id);

  socket.on("login", (username) => {
    onlineUsers.set(username, socket.id);
    socket.username = username;
    console.log(`${username} connected`);
  });

  // 🔹 send friend request live
  socket.on("sendRequest", async ({ from, to }) => {
    const userTo = await User.findOne({ username: to });
    if (!userTo) {
      socket.emit("alert", "User not found");
      return;
    }

    // prevent duplicates
    if (!userTo.requests.includes(from)) {
      userTo.requests.push(from);
      await userTo.save();
    }

    // notify sender
    socket.emit("alert", `Friend request sent to ${to}`);

    // ✅ live update receiver if online
    const targetSocket = onlineUsers.get(to);
    if (targetSocket) {
      io.to(targetSocket).emit("newRequest", from);
    }
  });

  // 🔹 accept friend request live
  socket.on("acceptRequest", async ({ from, to }) => {
    const user = await User.findOne({ username: to });
    const requester = await User.findOne({ username: from });
    if (!user || !requester) return;

    if (!user.friends.includes(from)) user.friends.push(from);
    if (!requester.friends.includes(to)) requester.friends.push(to);
    user.requests = user.requests.filter((r) => r !== from);

    await user.save();
    await requester.save();

    socket.emit("alert", `You and ${from} are now friends!`);
    const requesterSocket = onlineUsers.get(from);
    if (requesterSocket) {
      io.to(requesterSocket).emit("friendAdded", to);
    }
  });

  socket.on("disconnect", () => {
    if (socket.username) onlineUsers.delete(socket.username);
    console.log(`${socket.username || socket.id} disconnected`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
