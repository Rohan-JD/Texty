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

const dmBtn = document.getElementById("dmBtn");
const backBtn = document.getElementById("backBtn");
const settingsBtn = document.getElementById("settingsBtn");

const profileScreen = document.getElementById("profileScreen");
const settingsScreen = document.getElementById("settingsScreen");

const bioInput = document.getElementById("bioInput");
const saveBio = document.getElementById("saveBio");

let username = "";
let bio = "";
let mode = "global";
let currentDM = null;

loginBtn.onclick = () => {

const user = usernameInput.value.trim();
const pass = passwordInput.value.trim();

if(!user || !pass) return;

socket.emit("login",{username:user,password:pass});

};

socket.on("loginSuccess",(data)=>{

username = data.username;
bio = data.bio;

loginScreen.style.display="none";
app.style.display="flex";

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

if(mode==="global"){

socket.emit("chatMessage",{user:username,message:msg});

}else{

socket.emit("dm",{from:username,to:currentDM,message:msg});
addMessage("You → "+currentDM,msg);

}

messageInput.value="";

}

socket.on("chatMessage",(data)=>{
if(mode!=="global") return;
addMessage(data.user,data.message);
});

socket.on("dm",(data)=>{
if(mode!=="dm"||data.from!==currentDM) return;
addMessage(data.from,data.message);
});

dmBtn.onclick=()=>{

const target=prompt("DM username:");
if(!target||target===username) return;

mode="dm";
currentDM=target;

chatBox.innerHTML="";
backBtn.style.display="inline-block";

};

backBtn.onclick=()=>{

mode="global";
currentDM=null;

chatBox.innerHTML="";
profileScreen.style.display="none";
settingsScreen.style.display="none";

backBtn.style.display="none";

};

settingsBtn.onclick=()=>{

mode="settings";

chatBox.style.display="none";
settingsScreen.style.display="block";
profileScreen.style.display="none";

backBtn.style.display="inline-block";

};

saveBio.onclick=()=>{

bio=bioInput.value;

socket.emit("updateBio",{username,bio});

};

function openProfile(user){

mode="profile";

chatBox.style.display="none";
settingsScreen.style.display="none";
profileScreen.style.display="block";

backBtn.style.display="inline-block";

profileScreen.innerHTML=
"<h2>"+user+"</h2><p>Bio coming soon.</p>";

}

function addMessage(user,msg){

const div=document.createElement("div");
div.className="msg";

div.innerHTML=
`<span class="username" data-user="${user}">${user}</span>: ${msg}`;

chatBox.appendChild(div);
chatBox.scrollTop=chatBox.scrollHeight;

}

chatBox.addEventListener("click",(e)=>{

if(e.target.classList.contains("username")){

const user=e.target.getAttribute("data-user");
openProfile(user);

}

});
