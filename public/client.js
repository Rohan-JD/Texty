const socket = io();

setTimeout(() => {
    document.getElementById("cutscene").remove();
    document.getElementById("app").hidden = false;

    const username = prompt("Enter username");
    socket.emit("join", username);
}, 2000);

const input = document.getElementById("input");
const chat = document.getElementById("chat");
const usersDiv = document.getElementById("users");
const typingDiv = document.getElementById("typing");

input.addEventListener("keypress", e => {
    socket.emit("typing");
    if (e.key === "Enter" && input.value.trim()) {
        handleCommand(input.value);
        input.value = "";
    }
});

function handleCommand(text) {
    if (text.startsWith("/")) {
        if (text === "/clear") chat.innerHTML = "";
        if (text === "/roll") addSystem(`🎲 Rolled ${Math.ceil(Math.random()*6)}`);
        return;
    }
    socket.emit("chat", text);
}

socket.on("chat", data => {
    chat.innerHTML += `<div>
        <span class="time">[${data.time}]</span>
        <span class="username">${data.user}:</span>
        ${data.message}
    </div>`;
    chat.scrollTop = chat.scrollHeight;
});

socket.on("system", msg => addSystem(msg));

socket.on("typing", user => {
    typingDiv.textContent = `${user} is typing...`;
    setTimeout(() => typingDiv.textContent = "", 1000);
});

socket.on("userlist", list => {
    usersDiv.innerHTML = "👥 " + list.join(", ");
});

function addSystem(msg) {
    chat.innerHTML += `<div class="system">${msg}</div>`;
}
