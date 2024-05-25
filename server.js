const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors'); // Import the cors package

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow requests from all origins
        methods: ["GET", "POST"]
    }
});

app.use(cors()); // Use the cors middleware

const players = {};

io.on('connection', (socket) => {
  socket.on('newPlayer', (data) => {
    players[socket.id] = {
      username: data.username,
      position: { x: 0, y: 0, z: 0 },
    };
    io.emit('updatePlayers', players);
  });

  socket.on('move', (data) => {
    if (players[socket.id]) {
      players[socket.id].position = data.position;
      io.emit('updatePlayers', players);
    }
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('updatePlayers', players);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
