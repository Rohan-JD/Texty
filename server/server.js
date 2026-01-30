const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ---------- SERVE FRONTEND ----------
app.use(express.static(path.join(__dirname, "../public")));

// ---------- USERS ----------
const users = {}; // username -> socket

// ---------- SOCKET ----------
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // JOIN WITH USERNAME
  socket.on("join", (username) => {
    if (!username || users[username]) {
      socket.emit("joinError", "Username already taken");
      return;
    }

    socket.username = username;
    users[username] = socket;

    socket.emit("joinSuccess", username);

    io.emit("chatMessage", {
      user: "System",
      message: `${username} joined the chat`
    });
  });

  // GLOBAL CHAT
  socket.on("chatMessage", (message) => {
    if (!socket.username) return;

    io.emit("chatMessage", {
      user: socket.username,
      message
    });
  });

  // DMS
  socket.on("dm", ({ to, message }) => {
    if (!socket.username) return;

    const target = users[to];
    if (!target) {
      socket.emit("chatMessage", {
        user: "System",
        message: `User ${to} not found`
      });
      return;
    }

    target.emit("dm", {
      from: socket.username,
      message
    });
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    if (socket.username) {
      delete users[socket.username];

      io.emit("chatMessage", {
        user: "System",
        message: `${socket.username} left the chat`
      });
    }

    console.log("User disconnected:", socket.id);
  });
});

// ---------- PORT (RENDER NEEDS THIS) ----------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
