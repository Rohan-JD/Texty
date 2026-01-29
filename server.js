const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = {};

io.on("connection", socket => {
    socket.on("join", username => {
        users[socket.id] = username;
        io.emit("system", `🟢 ${username} joined Texty`);
        io.emit("userlist", Object.values(users));
    });

    socket.on("chat", msg => {
        io.emit("chat", {
            user: users[socket.id],
            message: msg,
            time: new Date().toLocaleTimeString()
        });
    });

    socket.on("typing", () => {
        socket.broadcast.emit("typing", users[socket.id]);
    });

    socket.on("disconnect", () => {
        const name = users[socket.id];
        delete users[socket.id];
        io.emit("system", `🔴 ${name} left Texty`);
        io.emit("userlist", Object.values(users));
    });
});

server.listen(3000, () => {
    console.log("🔥 TEXTY MAX running on http://localhost:3000");
});
