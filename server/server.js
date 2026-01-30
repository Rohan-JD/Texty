const users = new Set();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const users = {}; 
// socketId -> { username, friends:Set, requests:Set }

socket.on("dm", ({ to, message }) => {
  const targetSocket = users[to];
  if (targetSocket) {
    targetSocket.emit("dm", {
      from: socket.username,
      message
    });
  }
});

const usernames = new Set();

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("set-username", (username, cb) => {
    if (usernames.has(username)) {
      cb({ ok: false, msg: "Username already taken" });
      return;
      socket.on("join", (name) => {
  if (users.has(name)) {
    socket.emit("joinError", "Username already taken");
    return;
  }

  users.add(name);
  socket.username = name;
  socket.emit("joinSuccess", name);

       socket.on("disconnect", () => {
  if (socket.username) {
    users.delete(socket.username);
  }
});

});

    }

    usernames.add(username);
    users[socket.id] = {
      username,
      friends: new Set(),
      requests: new Set()
    };

    cb({ ok: true });
    io.emit("user-list", getUsernames());
  });

  socket.on("send-friend-request", (targetUsername) => {
    const sender = users[socket.id];
    if (!sender) return;

    const targetId = findSocketByUsername(targetUsername);
    if (!targetId) return;

    users[targetId].requests.add(sender.username);
    io.to(targetId).emit("friend-request", sender.username);
  });

  socket.on("accept-friend", (fromUsername) => {
    const user = users[socket.id];
    const fromId = findSocketByUsername(fromUsername);
    if (!fromId) return;

    user.requests.delete(fromUsername);
    user.friends.add(fromUsername);
    users[fromId].friends.add(user.username);

    io.to(fromId).emit("friend-added", user.username);
    socket.emit("friend-added", fromUsername);
  });

  socket.on("dm", ({ to, message }) => {
    const fromUser = users[socket.id];
    if (!fromUser || !fromUser.friends.has(to)) return;

    const targetId = findSocketByUsername(to);
    if (!targetId) return;

    io.to(targetId).emit("dm", {
      from: fromUser.username,
      message
    });
  });

  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      usernames.delete(user.username);
      delete users[socket.id];
      io.emit("user-list", getUsernames());
    }
  });
});

function findSocketByUsername(name) {
  return Object.keys(users).find(
    (id) => users[id].username === name
  );
}

function getUsernames() {
  return Object.values(users).map(u => u.username);
}

server.listen(3000, () =>
  console.log("Server running on port 3000")
);



