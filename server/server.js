const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const USERS_FILE = path.join(__dirname, "users.json");

let users = {};
let sockets = {};

// -------------------------
// LOAD SAVED USERS
// -------------------------

if (fs.existsSync(USERS_FILE)) {
    try {
        users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
    } catch {
        users = {};
    }
}

// -------------------------
// SAVE USERS
// -------------------------

function saveUsers() {
    fs.writeFileSync(
        USERS_FILE,
        JSON.stringify(users, null, 2),
        "utf8"
    );
}

// -------------------------
// ONLINE USERS
// -------------------------

function getOnlineUsers() {
    return Object.keys(sockets);
}

// -------------------------
// SOCKET CONNECTION
// -------------------------

io.on("connection", (socket) => {

    let currentUser = null;

    console.log("Socket connected:", socket.id);

    // =========================
    // LOGIN / REGISTER
    // =========================

    socket.on("login", (data) => {

        if (!data || typeof data !== "object") {
            socket.emit("loginError", "Invalid login.");
            return;
        }

        const username = String(data.username || "").trim();
        const password = String(data.password || "");

        // NO EMPTY USERNAME
        if (!username) {
            socket.emit("loginError", "Please enter a username.");
            return;
        }

        // NO EMPTY PASSWORD
        if (!password) {
            socket.emit("loginError", "Please enter a password.");
            return;
        }

        // Username rules
        if (username.length < 2) {
            socket.emit("loginError", "Username must be at least 2 characters.");
            return;
        }

        if (username.length > 20) {
            socket.emit("loginError", "Username must be 20 characters or less.");
            return;
        }

        // Basic allowed characters
        if (!/^[a-zA-Z0-9_ -]+$/.test(username)) {
            socket.emit(
                "loginError",
                "Username can only contain letters, numbers, spaces and _."
            );
            return;
        }

        // New account
        if (!users[username]) {

            users[username] = {
                password: password,
                bio: "Hello! I'm new to TEXTY."
            };

            saveUsers();
        }

        // Existing account
        if (users[username].password !== password) {
            socket.emit("loginError", "Wrong password.");
            return;
        }

        // Don't allow same account online twice
        if (sockets[username]) {
            socket.emit("loginError", "That account is already online.");
            return;
        }

        currentUser = username;
        sockets[username] = socket.id;

        // Login success
        socket.emit("loginSuccess", {
            username: username,
            bio: users[username].bio
        });

        // Update everyone
        io.emit(
            "systemMessage",
            `${username} joined TEXTY`
        );

        io.emit(
            "userList",
            getOnlineUsers()
        );

        console.log(username, "logged in");
    });

    // =========================
    // GLOBAL CHAT
    // =========================

    socket.on("chatMessage", (data) => {

        if (!currentUser) {
            return;
        }

        if (!data || typeof data.message !== "string") {
            return;
        }

        const message = data.message.trim();

        // REJECT EMPTY MESSAGE
        if (!message) {
            return;
        }

        // Limit message size
        if (message.length > 500) {
            return;
        }

        io.emit("chatMessage", {
            user: currentUser,
            message: message
        });
    });

    // =========================
    // DIRECT MESSAGES
    // =========================

    socket.on("dm", (data) => {

        if (!currentUser) {
            return;
        }

        if (!data || typeof data !== "object") {
            return;
        }

        const to = String(data.to || "").trim();
        const message = String(data.message || "").trim();

        if (!to || !message) {
            return;
        }

        if (message.length > 500) {
            return;
        }

        const targetSocketId = sockets[to];

        if (!targetSocketId) {
            socket.emit("dmError", `User "${to}" is not online.`);
            return;
        }

        // Send to receiver
        io.to(targetSocketId).emit("dm", {
            from: currentUser,
            message: message
        });

        // Send copy to sender
        socket.emit("dm", {
            from: currentUser,
            to: to,
            message: message,
            own: true
        });
    });

    // =========================
    // UPDATE BIO
    // =========================

    socket.on("updateBio", (data) => {

        if (!currentUser) {
            return;
        }

        if (!data || typeof data.bio !== "string") {
            return;
        }

        const bio = data.bio.trim();

        if (bio.length > 160) {
            return;
        }

        users[currentUser].bio = bio;

        saveUsers();

        socket.emit("bioUpdated", bio);
    });

    // =========================
    // VIEW PROFILE
    // =========================

    socket.on("getProfile", (requestedUsername) => {

        if (!currentUser) {
            return;
        }

        const username = String(requestedUsername || "").trim();

        if (!username || !users[username]) {
            socket.emit("profileError", "User not found.");
            return;
        }

        socket.emit("profileData", {
            username: username,
            bio: users[username].bio,
            online: Boolean(sockets[username])
        });
    });

    // =========================
    // DISCONNECT
    // =========================

    socket.on("disconnect", () => {

        if (!currentUser) {
            return;
        }

        delete sockets[currentUser];

        io.emit(
            "systemMessage",
            `${currentUser} left TEXTY`
        );

        io.emit(
            "userList",
            getOnlineUsers()
        );

        console.log(currentUser, "disconnected");
    });
});

// -------------------------
// START SERVER
// -------------------------

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`TEXTY running on port ${PORT}`);
});
