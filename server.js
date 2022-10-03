const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const port = process.env.PORT || 3000;
const app = express();
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

var users = {};

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  }
});

io.on('connection', (socket) => {
  // register new user
  socket.on("register", (data) => {
    let username = data.user.username;
    let connection = data.user.connection;
    let locationGrant  = data.user.location;

    socket.username = username;
    socket.connection = connection;
    socket.glow = false;

    // add to users table
    users[username] = socket;

    // send online status
    if(users.hasOwnProperty(connection)) {
      users[connection].emit("connection-status", "online");
      socket.emit("connection-status", "online");

      // if connection is thinking about you, send signal(true)
      if(users[connection].glow) {
        socket.emit("toggle-lamp", true);
      }
    }

    if(locationGrant) {
      console.log(`${username} has connected from ${data.user.lat}, ${data.user.long}`);
    } else {
      console.log(`${username} has connected. No location granted`);
    }

  });

  // recieve signal and emit to connection
  socket.on("thinking-about-connection", (data) => {
    let username = data.user.username;
    let connection = data.user.connection;
    socket.glow = data.signal;

    if(users.hasOwnProperty(connection)) {
      let toUser = users[connection];

      toUser.emit("toggle-lamp", data.signal);
    }
  });

  socket.on("disconnect", () => {
    let username = socket.username;
    let connection = socket.connection;

    // send his connection offline status
    if(users.hasOwnProperty(connection)) {
      users[connection].emit("connection-status", "offline");
    }

    delete users.username;

    console.log(`${username} has disconnected`);
  })
});

httpServer.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
