if(!localStorage.getItem("user")) {
    let username = prompt("What's your name?");
    let connection = prompt("Whom do you want to connect?");

    let obj = {
        username: username,
        connection: connection,
    };

    localStorage.setItem("user", JSON.stringify(obj));
}

const socket = io();

const user = JSON.parse(localStorage.getItem("user"));

// register user
socket.emit("register", {user: user});

var lampRef = document.querySelector(".lamp");
var statusRef = document.querySelector(".status");
var circleRef = document.querySelector(".circle");

// thinking about connection
var signal = false;
lampRef.addEventListener('click', (e) => {
    signal = !signal;
    lampRef.classList.toggle("send-signal");
    socket.emit('thinking-about-connection', {user: user, signal: signal});
});

// show that other person is thinking about you
socket.on('toggle-lamp', (signal) => {
    if(signal)
        lampRef.classList.add("recieve-signal");
    else
        lampRef.classList.remove("recieve-signal");
});

// show that other person is online/offline
socket.on("connection-status", (status) => {
    statusRef.classList.toggle("scroll");
    circleRef.classList.toggle("change-color");

    // if offline, remove glow
    if(status === "offline") {
        lampRef.classList.remove("recieve-signal");
    }
});