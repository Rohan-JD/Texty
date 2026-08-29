const socket = io();


// =====================================================
// ELEMENTS
// =====================================================

const loginScreen =
    document.getElementById("login");

const usernameInput =
    document.getElementById("username");

const passwordInput =
    document.getElementById("password");

const loginError =
    document.getElementById("loginError");

const loginButton =
    document.getElementById("loginButton");

const chat =
    document.getElementById("chat");

const messages =
    document.getElementById("messages");

const messageInput =
    document.getElementById("messageInput");

const users =
    document.getElementById("users");

const myName =
    document.getElementById("myName");

const topUser =
    document.getElementById("topUser");

const bio =
    document.getElementById("bio");

const profileView =
    document.getElementById("profileView");

const profileUsername =
    document.getElementById("profileUsername");

const profileBio =
    document.getElementById("profileBio");

const profileStatus =
    document.getElementById("profileStatus");

const profileBackButton =
    document.getElementById("profileBackButton");


// =====================================================
// VARIABLES
// =====================================================

let myUsername = "";


// =====================================================
// LOGIN
// =====================================================

function login() {

    const username =
        usernameInput.value.trim();

    const password =
        passwordInput.value;

    // EMPTY USERNAME
    if (!username) {

        loginError.textContent =
            "Please enter a username.";

        usernameInput.focus();

        return;
    }

    // EMPTY PASSWORD
    if (!password) {

        loginError.textContent =
            "Please enter a password.";

        passwordInput.focus();

        return;
    }

    loginError.textContent =
        "Connecting...";

    loginButton.disabled = true;

    socket.emit("login", {
        username: username,
        password: password
    });
}


// =====================================================
// LOGIN WITH ENTER KEY
// =====================================================

usernameInput.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {
            login();
        }

    }
);


passwordInput.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {
            login();
        }

    }
);


// =====================================================
// LOGIN SUCCESS
// =====================================================

socket.on("loginSuccess", (data) => {

    myUsername =
        data.username;

    loginScreen.style.display =
        "none";

    chat.style.display =
        "flex";

    myName.textContent =
        myUsername;

    topUser.textContent =
        myUsername;

    bio.value =
        data.bio || "";

    loginButton.disabled =
        false;

    loginError.textContent =
        "";

});


// =====================================================
// LOGIN ERROR
// =====================================================

socket.on("loginError", (message) => {

    loginButton.disabled =
        false;

    loginError.textContent =
        message;

});


// =====================================================
// SEND GLOBAL MESSAGE
// =====================================================

function sendMessage() {

    if (!myUsername) {
        return;
    }

    const message =
        messageInput.value.trim();

    // EMPTY MESSAGE = DO NOTHING
    if (!message) {

        messageInput.value =
            "";

        messageInput.focus();

        return;
    }

    socket.emit(
        "chatMessage",
        {
            message: message
        }
    );

    messageInput.value =
        "";

    messageInput.focus();
}


// =====================================================
// ENTER TO SEND
// =====================================================

messageInput.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();
        }

    }
);


// =====================================================
// RECEIVE GLOBAL MESSAGE
// =====================================================

socket.on("chatMessage", (data) => {

    addMessage(
        data.user,
        data.message
    );

});


// =====================================================
// ADD MESSAGE
// =====================================================

function addMessage(user, message) {

    const div =
        document.createElement("div");

    div.className =
        "messageRow";


    const username =
        document.createElement("span");

    username.className =
        "messageUsername";

    username.textContent =
        user;


    // Click username → profile
    username.addEventListener(
        "click",
        () => {

            openProfile(user);

        }
    );


    const separator =
        document.createTextNode(": ");


    const text =
        document.createElement("span");

    text.className =
        "messageText";

    text.textContent =
        message;


    div.appendChild(username);

    div.appendChild(separator);

    div.appendChild(text);

    messages.appendChild(div);

    messages.scrollTop =
        messages.scrollHeight;
}


// =====================================================
// SYSTEM MESSAGE
// =====================================================

socket.on(
    "systemMessage",
    (message) => {

        const div =
            document.createElement("div");

        div.className =
            "systemMessage";

        div.textContent =
            "[SYSTEM] " + message;

        messages.appendChild(div);

        messages.scrollTop =
            messages.scrollHeight;
    }
);


// =====================================================
// ONLINE USER LIST
// =====================================================

socket.on("userList", (list) => {

    users.innerHTML = "";

    if (!list.length) {

        users.textContent =
            "No one online.";

        return;
    }


    list.forEach((user) => {

        const div =
            document.createElement("div");

        div.className =
            "onlineUser";


        const dot =
            document.createElement("span");

        dot.className =
            "onlineDot";


        const name =
            document.createElement("span");

        name.textContent =
            user;


        div.appendChild(dot);

        div.appendChild(name);


        // Click online user → profile
        div.addEventListener(
            "click",
            () => {

                openProfile(user);

            }
        );


        users.appendChild(div);

    });

});


// =====================================================
// SAVE BIO
// =====================================================

function saveBio() {

    if (!myUsername) {
        return;
    }

    const newBio =
        bio.value.trim();


    if (newBio.length > 160) {

        bio.value =
            newBio.substring(0, 160);

        return;
    }


    socket.emit(
        "updateBio",
        {
            bio: newBio
        }
    );

}


// =====================================================
// BIO SAVED
// =====================================================

socket.on("bioUpdated", (savedBio) => {

    bio.value =
        savedBio;

});


// =====================================================
// OPEN PROFILE
// =====================================================

function openProfile(username) {

    socket.emit(
        "getProfile",
        username
    );

}


// =====================================================
// PROFILE DATA
// =====================================================

socket.on(
    "profileData",
    (data) => {

        profileUsername.textContent =
            data.username;


        profileBio.textContent =
            data.bio || "No bio yet.";


        if (data.online) {

            profileStatus.textContent =
                "● ONLINE";

            profileStatus.className =
                "profileOnline onlineStatus";

        } else {

            profileStatus.textContent =
                "● OFFLINE";

            profileStatus.className =
                "profileOnline offlineStatus";
        }


        // Hide app
        chat.style.display =
            "none";


        // Show profile
        profileView.style.display =
            "flex";

    }
);


// =====================================================
// PROFILE ERROR
// =====================================================

socket.on(
    "profileError",
    (message) => {

        alert(message);

    }
);


// =====================================================
// BACK FROM PROFILE
// =====================================================

profileBackButton.addEventListener(
    "click",
    () => {

        profileView.style.display =
            "none";

        chat.style.display =
            "flex";

    }
);


// =====================================================
// DMs
// =====================================================

socket.on("dm", (data) => {

    const prefix =
        data.own
            ? `You → ${data.to}:`
            : `[DM] ${data.from}:`;

    const div =
        document.createElement("div");

    div.className =
        "dmMessage";

    div.textContent =
        `${prefix} ${data.message}`;

    messages.appendChild(div);

    messages.scrollTop =
        messages.scrollHeight;
});


// =====================================================
// DM ERROR
// =====================================================

socket.on("dmError", (message) => {

    alert(message);

});
