const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const USERS_FILE = "users.json";

let users = {};
let sockets = {};
let onlineUsers = [];

if (fs.existsSync(USERS_FILE)) {
  users = JSON.parse(fs.readFileSync(USERS_FILE));
}

function saveUsers() {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

io.on("connection", (socket) => {

  let currentUser = null;

  socket.on("login", ({ username, password }) => {

    if (!users[username]) {
      users[username] = {
        password: password,
        bio: "Hello! I'm new to TEXTY."
      };
      saveUsers();
    }

    if (users[username].password !== password) {
      socket.emit("loginError", "Wrong password");
      return;
    }

    currentUser = username;
    sockets[username] = socket.id;

    if (!onlineUsers.includes(username)) {
      onlineUsers.push(username);
    }

    socket.emit("loginSuccess", {
      username: username,
      bio: users[username].bio
    });

    io.emit("systemMessage", `${username} joined TEXTY`);
    io.emit("userList", onlineUsers);
  });

  socket.on("chatMessage", ({ user, message }) => {
    io.emit("chatMessage", { user, message });
  });

  socket.on("dm", ({ from, to, message }) => {

    const target = sockets[to];

    if (target) {
      io.to(target).emit("dm", { from, message });
    }

    socket.emit("dm", { from, message });
  });

  socket.on("updateBio", ({ username, bio }) => {

    if (users[username]) {
      users[username].bio = bio;
      saveUsers();
    }

  });

  socket.on("disconnect", () => {

    if (currentUser) {

      delete sockets[currentUser];

      onlineUsers = onlineUsers.filter(u => u !== currentUser);

      io.emit("systemMessage", `${currentUser} left TEXTY`);
      io.emit("userList", onlineUsers);
    }

  });

});

const PORT = 3000;

server.listen(PORT, () => {
  console.log("TEXTY running on port " + PORT);
});
