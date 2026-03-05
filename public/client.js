const socket = io();

const loginScreen = document.getElementById("loginScreen");
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");

const app = document.getElementById("app");
const chatBox = document.getElementById("chatBox");

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const settingsBtn = document.getElementById("settingsBtn");
const settingsScreen = document.getElementById("settingsScreen");

const bioInput = document.getElementById("bioInput");
const saveBio = document.getElementById("saveBio");

const userDisplay = document.getElementById("userDisplay");

let username = "";
let bio = "";

loginBtn.onclick = () => {

const user = usernameInput.value.trim();
const pass = passwordInput.value.trim();

if(!user || !pass) return;

socket.emit("login",{
username:user,
password:pass
});

};

socket.on("loginSuccess",(data)=>{

username = data.username;
bio = data.bio;

loginScreen.style.display="none";
app.style.display="flex";

userDisplay.textContent=username;

bioInput.value=bio;

});

socket.on("loginError",(msg)=>{

loginError.textContent=msg;

});

sendBtn.onclick=sendMessage;

messageInput.addEventListener("keydown",(e)=>{
if(e.key==="Enter") sendMessage();
});

function sendMessage(){

const msg = messageInput.value.trim();

if(!msg) return;

socket.emit("chatMessage",{
user:username,
message:msg
});

messageInput.value="";

}

socket.on("chatMessage",(data)=>{

addMessage(data.user,data.message);

});

function addMessage(user,msg){

const div=document.createElement("div");

div.className="msg";

div.innerHTML=`<span class="username">${user}</span>: ${msg}`;

chatBox.appendChild(div);

chatBox.scrollTop=chatBox.scrollHeight;

}

settingsBtn.onclick=()=>{

settingsScreen.style.display=
settingsScreen.style.display==="none"
?"block":"none";

};

saveBio.onclick=()=>{

bio=bioInput.value;

socket.emit("updateBio",{
username:username,
bio:bio
});

};
