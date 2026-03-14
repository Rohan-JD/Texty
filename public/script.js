const socket = io();

let myUsername = "";

function login(){

const username = document.getElementById("username").value;
const password = document.getElementById("password").value;

socket.emit("login",{username,password});

}

socket.on("loginError",(msg)=>{

document.getElementById("loginError").innerText = msg;

});

socket.on("loginSuccess",(data)=>{

myUsername = data.username;

document.getElementById("login").style.display="none";
document.getElementById("chat").style.display="block";

document.getElementById("myName").innerText = myUsername;

document.getElementById("bio").value = data.bio;

});

function sendMessage(){

const message = document.getElementById("messageInput").value;

socket.emit("chatMessage",{user:myUsername,message});

document.getElementById("messageInput").value="";

}

socket.on("chatMessage",(data)=>{

const div = document.createElement("div");

div.innerText = data.user + ": " + data.message;

document.getElementById("messages").appendChild(div);

});

socket.on("systemMessage",(msg)=>{

const div = document.createElement("div");

div.innerText = "[SYSTEM] " + msg;

div.style.color="gray";

document.getElementById("messages").appendChild(div);

});

socket.on("userList",(list)=>{

const usersDiv = document.getElementById("users");

usersDiv.innerHTML="<h3>Online</h3>";

list.forEach(u=>{

const d = document.createElement("div");

d.innerText = u;

d.onclick = ()=>{

const message = prompt("DM to "+u);

if(message){

socket.emit("dm",{from:myUsername,to:u,message});

}

};

usersDiv.appendChild(d);

});

});

socket.on("dm",(data)=>{

const div = document.createElement("div");

div.innerText = "[DM] "+data.from+": "+data.message;

div.style.color="purple";

document.getElementById("messages").appendChild(div);

});

function saveBio(){

const bio = document.getElementById("bio").value;

socket.emit("updateBio",{username:myUsername,bio});

alert("Bio saved");

  // allow pressing Enter to login
document.addEventListener("DOMContentLoaded", () => {

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

if(usernameInput){
usernameInput.addEventListener("keydown",(e)=>{
if(e.key === "Enter") login();
});
}

if(passwordInput){
passwordInput.addEventListener("keydown",(e)=>{
if(e.key === "Enter") login();
});
}

});

}
