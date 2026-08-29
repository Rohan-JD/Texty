const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --------------------------------------------------
// PATHS
// server.js = /server/server.js
// website   = /public
// --------------------------------------------------

const publicPath = path.join(__dirname, "..", "public");
const usersFile = path.join(__dirname, "..", "users.json");

// --------------------------------------------------
// WEBSITE
// --------------------------------------------------

app.use(express.static(publicPath));

app.get("/", (req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
});

// --------------------------------------------------
// USERS
// --------------------------------------------------

let users = {};
let sockets = {};

if (fs.existsSync(usersFile)) {
    try {
        users = JSON.parse(fs.readFileSync(usersFile, "utf8"));
    } catch {
        users = {};
    }
}

function saveUsers() {
    fs.writeFileSync(
        usersFile,
        JSON.stringify(users, null, 2),
        "utf8"
    );
}

function onlineUsers() {
    return Object.keys(sockets);
}

// --------------------------------------------------
// SOCKET.IO
// --------------------------------------------------

io.on("connection", (socket) => {

    let currentUser = null;

    console.log("CONNECTED:", socket.id);

    // -------------------------
    // LOGIN / REGISTER
    // -------------------------

    socket.on("login", (data) => {

        const username = String(data?.username || "").trim();
        const password = String(data?.password || "");

        if (!username) {
            socket.emit(
                "loginError",
                "Please enter a username."
            );
            return;
        }

        if (!password) {
            socket.emit(
                "loginError",
                "Please enter a password."
            );
            return;
        }

        if (username.length < 2) {
            socket.emit(
                "loginError",
                "Username must be at least 2 characters."
            );
            return;
        }

        if (username.length > 20) {
            socket.emit(
                "loginError",
                "Username must be 20 characters or less."
            );
            return;
        }

        if (!users[username]) {

            users[username] = {
                password: password,
                bio: "Hello! I'm new to TEXTY."
            };

            saveUsers();
        }

        if (users[username].password !== password) {

            socket.emit(
                "loginError",
                "Wrong password."
            );

            return;
        }

        if (sockets[username]) {

            socket.emit(
                "loginError",
                "That account is already online."
            );

            return;
        }

        currentUser = username;
        sockets[username] = socket.id;

        socket.emit("loginSuccess", {
            username: username,
            bio: users[username].bio
        });

        io.emit(
            "systemMessage",
            `${username} joined TEXTY`
        );

        io.emit(
            "userList",
            onlineUsers()
        );
    });

    // -------------------------
    // GLOBAL CHAT
    // -------------------------

    socket.on("chatMessage", (data) => {

        if (!currentUser) return;

        const message = String(
            data?.message || ""
        ).trim();

        if (!message) return;

        if (message.length > 500) return;

        io.emit("chatMessage", {
            user: currentUser,
            message: message
        });
    });

    // -------------------------
    // DIRECT MESSAGES
    // -------------------------

    socket.on("dm", (data) => {

        if (!currentUser) return;

        const to = String(
            data?.to || ""
        ).trim();

        const message = String(
            data?.message || ""
        ).trim();

        if (!to || !message) return;

        const target = sockets[to];

        if (!target) {

            socket.emit(
                "dmError",
                `User "${to}" is not online.`
            );

            return;
        }

        io.to(target).emit("dm", {
            from: currentUser,
            message: message
        });

        socket.emit("dm", {
            from: currentUser,
            to: to,
            message: message,
            own: true
        });
    });

    // -------------------------
    // BIO
    // -------------------------

    socket.on("updateBio", (data) => {

        if (!currentUser) return;

        const newBio = String(
            data?.bio || ""
        ).trim();

        if (newBio.length > 160) return;

        users[currentUser].bio = newBio;

        saveUsers();

        socket.emit(
            "bioUpdated",
            newBio
        );
    });

    // -------------------------
    // PROFILE
    // -------------------------

    socket.on("getProfile", (username) => {

        if (!currentUser) return;

        const requested = String(
            username || ""
        ).trim();

        if (!users[requested]) {

            socket.emit(
                "profileError",
                "User not found."
            );

            return;
        }

        socket.emit("profileData", {
            username: requested,
            bio: users[requested].bio,
            online: Boolean(sockets[requested])
        });
    });

    // -------------------------
    // DISCONNECT
    // -------------------------

    socket.on("disconnect", () => {

        if (!currentUser) return;

        delete sockets[currentUser];

        io.emit(
            "systemMessage",
            `${currentUser} left TEXTY`
        );

        io.emit(
            "userList",
            onlineUsers()
        );

        console.log("DISCONNECTED:", currentUser);
    });
});

// --------------------------------------------------
// START
// --------------------------------------------------

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {

    console.log(
        `TEXTY RUNNING ON PORT ${PORT}`
    );

    console.log(
        `SERVING: ${publicPath}`
    );

});
