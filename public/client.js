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
});

