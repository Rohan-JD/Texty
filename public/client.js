const socket = io();

const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const dmBtn = document.getElementById("dmBtn");
const backBtn = document.getElementById("backBtn");
const settingsBtn = document.getElementById("settingsBtn");

const usernameScreen = document.getElementById("usernameScreen");
const usernameInput = document.getElementById("usernameInput");
const joinBtn = document.getElementById("joinBtn");
const errorText = document.getElementById("userError");

const app = document.getElementById("app");
const profileScreen = document.getElementById("profileScreen");
const settingsScreen = document.getElementById("settingsScreen");

let username = null;
let mode = "global";
let currentDM = null;

// -------- JOIN --------
joinBtn.onclick = () => {
  const name = usernameInput.value.trim();
  if (!name) {
    errorText.textContent = "Username required";
    return;
  }
  socket.emit("join", name);
};

socket.on("joinSuccess", (name) => {
  username = name;
  usernameScreen.style.display = "none";
  app.style.display = "flex";
});

socket.on("joinError", (msg) => {
  errorText.textContent = msg;
});

// -------- SEND --------
sendBtn.onclick = sendMessage;
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const msg = messageInput.value.trim();
  if (!msg || !username) return;

  if (mode === "global") {
    socket.emit("chatMessage", msg);
  } else if (mode === "dm") {
    socket.emit("dm", { to: currentDM, message: msg });
    addMessage(`You → ${currentDM}`, msg);
  }

  messageInput.value = "";
}

// -------- RECEIVE --------
socket.on("chatMessage", (data) => {
  if (mode !== "global") return;
  addMessage(data.user, data.message);
});

socket.on("dm", (data) => {
  if (mode !== "dm" || data.from !== currentDM) return;
  addMessage(data.from, data.message);
});

// -------- DMS --------
dmBtn.onclick = () => {
  const target = prompt("DM username:");
  if (!target || target === username) return;

  mode = "dm";
  currentDM = target;

  chatBox.innerHTML = "";
  chatBox.style.display = "block";
  profileScreen.style.display = "none";
  settingsScreen.style.display = "none";

  backBtn.style.display = "inline-block";
};

// -------- SETTINGS --------
settingsBtn.onclick = () => {
  mode = "settings";

  chatBox.style.display = "none";
  profileScreen.style.display = "none";
  settingsScreen.style.display = "block";

  backBtn.style.display = "inline-block";
};

// -------- BACK --------
backBtn.onclick = () => {
  mode = "global";
  currentDM = null;

  chatBox.style.display = "block";
  profileScreen.style.display = "none";
  settingsScreen.style.display = "none";

  backBtn.style.display = "none";
};

// -------- PROFILE --------
function openProfile(user) {
  mode = "profile";

  chatBox.style.display = "none";
  settingsScreen.style.display = "none";
  profileScreen.style.display = "block";

  backBtn.style.display = "inline-block";

  profileScreen.innerHTML = `
    <div class="profileCard">
      <h2>${user}</h2>
      <p>Bio: This is ${user}'s profile.</p>
      <p>Status: Online</p>
    </div>
  `;
}

// -------- UI --------
function addMessage(user, msg) {
  const div = document.createElement("div");
  div.className = "msg";
  div.innerHTML = `<span class="username" data-user="${user}">${user}</span>: ${msg}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

chatBox.addEventListener("click", (e) => {
  if (e.target.classList.contains("username")) {
    const user = e.target.getAttribute("data-user");
    openProfile(user);
  }
});


