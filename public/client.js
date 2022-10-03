if(!localStorage.getItem("user")) {
    let username = prompt("What's your name?");
    let connection = prompt("Whom do you want to connect?");

    let obj = {
        username: username.toUpperCase(),
        connection: connection.toUpperCase(),
    };

    localStorage.setItem("user", JSON.stringify(obj));
}

const socket = io();

const user = JSON.parse(localStorage.getItem("user"));

navigator.geolocation.getCurrentPosition((position) => {
    // set location
    user.lat = position.coords.latitude;
    user.long = position.coords.longitude;
    user.location = true;

    // register user
    socket.emit("register", {user: user});
}, (err) => {
    user.location = false;
    // simply register user
    socket.emit("register", {user: user});
}, {
    maximumAge: 60 * 60 * 1000,
});


var lampRef = document.querySelector(".lamp");
var statusRef = document.querySelector(".status");

// thinking about connection
var signal = false;
lampRef.addEventListener('click', (e) => {
    signal = !signal;
    
    if(signal) {
        myFunction_set("green");
    } else {
        myFunction_set("red");
    }
    
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
    statusRef.classList.toggle("change-color");

    // if offline, remove glow
    if(status === "offline") {
        lampRef.classList.remove("recieve-signal");
    }
});

var r = document.querySelector(':root');

// Create a function for setting a variable value
function myFunction_set(color) {
  // Set the value of variable --blue to another value (in this case "lightblue")
  r.style.setProperty('--lamp-color', color);
}
