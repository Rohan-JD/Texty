const socket = io();

const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const dmBtn = document.getElementById("dmBtn");
const backBtn = document.getElementById("backBtn");

const usernameScreen = document.getElementById("usernameScreen");
const usernameInput = document.getElementById("usernameInput");
const joinBtn = document.getElementById("joinBtn");
const errorText = document.getElementById("userError");

let username = null;
let mode = "global";
let currentDM = null;

// -------- JOIN --------
joinBtn.onclick = () => {
  const name = usernameInput.value.trim();
  if (!name) return errorText.textContent = "Username required";
  socket.emit("join", name);
};

socket.on("joinSuccess", (name) => {
  username = name;
  usernameScreen.style.display = "none";
});

socket.on("joinError", (msg) => {
  errorText.textContent = msg;
});

// -------- SEND --------
sendBtn.onclick = sendMessage;
messageInput.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const msg = messageInput.value.trim();
  if (!msg || !username) return;

  if (mode === "global") {
    socket.emit("chatMessage", msg);
  } else {
    socket.emit("dm", { to: currentDM, message: msg });
    addMessage(`You → ${currentDM}`, msg);
  }

  messageInput.value = "";
}

// -------- RECEIVE --------
socket.on("chatMessage", data => {
  if (mode !== "global") return;
  addMessage(data.user, data.message);
});

socket.on("dm", data => {
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
  backBtn.style.display = "inline-block";
};

// -------- BACK TO GLOBAL --------
backBtn.onclick = () => {
  mode = "global";
  currentDM = null;
  chatBox.innerHTML = "";
  backBtn.style.display = "none";
};

// -------- UI --------
function addMessage(user, msg) {
  const div = document.createElement("div");
  div.className = "msg";
  div.innerHTML = `<b>${user}:</b> ${msg}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}
