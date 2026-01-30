let username = null;

const joinBtn = document.getElementById("joinBtn");
const usernameInput = document.getElementById("usernameInput");
const usernameScreen = document.getElementById("usernameScreen");
const errorText = document.getElementById("userError");

joinBtn.onclick = () => {
  const name = usernameInput.value.trim();
  if (!name) {
    errorText.textContent = "Username required";
    return;
  }

  socket.emit("join", name);
};

const socket = io();

function setUsername() {
  const username = document.getElementById("username").value;

  socket.emit("set-username", username, (res) => {
    if (!res.ok) {
      alert(res.msg);
    } else {
      document.getElementById("login").hidden = true;
      document.getElementById("app").hidden = false;
    }
  });
}

socket.on("user-list", (users) => {
  const ul = document.getElementById("users");
  ul.innerHTML = "";

  users.forEach(u => {
    const li = document.createElement("li");
    li.textContent = u;
    li.onclick = () => socket.emit("send-friend-request", u);
    ul.appendChild(li);
  });
});

socket.on("friend-request", (from) => {
  if (confirm(`Friend request from ${from}`)) {
    socket.emit("accept-friend", from);
  }
});

socket.on("friend-added", (friend) => {
  const ul = document.getElementById("friends");
  const li = document.createElement("li");
  li.textContent = friend;
  ul.appendChild(li);
});

function sendDM() {
  const to = document.getElementById("dmUser").value;
  const message = document.getElementById("dmMsg").value;

  socket.emit("dm", { to, message });
}

socket.on("dm", ({ from, message }) => {
  const div = document.getElementById("messages");
  div.innerHTML += `<p><b>${from}:</b> ${message}</p>`;

  const globalView = document.getElementById("globalView");
const dmView = document.getElementById("dmView");

document.getElementById("dmToggle").onclick = () => {
  globalView.style.display = "none";
  dmView.style.display = "block";
};

document.getElementById("backBtn").onclick = () => {
  dmView.style.display = "none";
  globalView.style.display = "block";
};


});



