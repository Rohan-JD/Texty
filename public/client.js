const socket = io();

// ---------- ELEMENTS ----------
const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const dmBtn = document.getElementById("dmBtn");

const usernameScreen = document.getElementById("usernameScreen");
const usernameInput = document.getElementById("usernameInput");
const joinBtn = document.getElementById("joinBtn");
const errorText = document.getElementById("userError");

let username = null;
let mode = "global"; // "global" or "dm"
let currentDM = null;

// ---------- JOIN ----------
joinBtn.onclick = () => {
  const name = usernameInput.value.trim();
  if (!name) return (errorText.textContent = "Username required");

  socket.emit("join", name);
};

socket.on("joinSuccess", (name) => {
  username = name;
  usernameScreen.style.display = "none";
  systemMessage(`Joined as ${name}`);
});

socket.on("joinError", (msg) => {
  errorText.textContent = msg;
});

// ---------- SEND ----------
sendBtn.onclick = sendMessage;
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const msg = messageInput.value.trim();
  if (!msg || !username) return;

  if (mode === "global") {
    socket.emit("chatMessage", msg);
  } else if (mode === "dm" && currentDM) {
    socket.emit("dm", {
      to: currentDM,
      message: msg
    });

    addMessage(`You → ${currentDM}`, msg);
  }

  messageInput.value = "";
}

// ---------- GLOBAL CHAT ----------
socket.on("chatMessage", (data) => {
  if (mode !== "global") return;
  addMessage(data.user, data.message);
});

// ---------- DMS ----------
socket.on("dm", (data) => {
  if (mode !== "dm" || data.from !== currentDM) {
    systemMessage(`New DM from ${data.from}`);
    return;
  }

  addMessage(data.from, data.message);
});

// ---------- UI HELPERS ----------
function addMessage(user, msg) {
  const div = document.createElement("div");
  div.className = "msg";
  div.innerHTML = `<b>${user}:</b> ${msg}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function systemMessage(text) {
  const div = document.createElement("div");
  div.className = "msg";
  div.innerHTML = `<i>${text}</i>`;
  chatBox.appendChild(div);
}

// ---------- DM BUTTON ----------
dmBtn.onclick = () => {
  const target = prompt("DM username:");
  if (!target || target === username) return;

  mode = "dm";
  currentDM = target;
  chatBox.innerHTML = "";
  systemMessage(`DMs with ${target}`);
};

// ---------- BACK TO GLOBAL ----------
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && mode === "dm") {
    mode = "global";
    currentDM = null;
    chatBox.innerHTML = "";
    systemMessage("Back to Global Chat");
  }
});



