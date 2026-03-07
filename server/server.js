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

// Load saved users
if (fs.existsSync(USERS_FILE)) {
  users = JSON.parse(fs.readFileSync(USERS_FILE));
}

// Save users to file
function saveUsers() {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

io.on("connection", (socket) => {

  // LOGIN / REGISTER
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

    sockets[username] = socket.id;

    socket.emit("loginSuccess", {
      username: username,
      bio: users[username].bio
    });

  });

  // GLOBAL CHAT
  socket.on("chatMessage", ({ user, message }) => {
    io.emit("chatMessage", { user, message });
  });

  // DMs
  socket.on("dm", ({ from, to, message }) => {
    const target = sockets[to];

    if (target) {
      io.to(target).emit("dm", { from, message });
    }
  });

  // UPDATE BIO
  socket.on("updateBio", ({ username, bio }) => {

    if (users[username]) {
      users[username].bio = bio;
      saveUsers();
    }

  });

});

// Render requires using its PORT
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});





