const serverUrl = 'ws://165.232.188.93:3000';
const localConnection = new RTCPeerConnection();
const ws = new WebSocket(serverUrl);
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerId = generatePlayerId();
const player = { id: playerId, x: 400, y: 300, speed: 5 };
const players = {};  // Store other players' states

// Generate a unique player ID
function generatePlayerId() {
    return 'player-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
}


// Handle arrow key presses
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp': player.y -= player.speed; break;
        case 'ArrowDown': player.y += player.speed; break;
        case 'ArrowLeft': player.x -= player.speed; break;
        case 'ArrowRight': player.x += player.speed; break;
    }
    sendPlayerState();  // Send updated state to peers
});

document.getElementById('controls').addEventListener('touchstart', function(event) {
    event.preventDefault();
  });
  
// Function to generate a color from a player's ID
function generateColor(id) {
    // Create a hash from the ID
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert the hash to an RGB color
    const color = `rgb(${(hash >> 0) & 255}, ${(hash >> 8) & 255}, ${(hash >> 16) & 255})`;
    return color;
}


// Draw players on the canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x, player.y, 20, 20);  // Draw local player

    for (const id in players) {
        const p = JSON.parse(players[id]);
        ctx.fillStyle = generateColor(id);
        ctx.fillRect(p.x, p.y, 20, 20);  // Draw other players
    }
    requestAnimationFrame(draw);
}

// Send player state to peers
function sendPlayerState() {
    const state = JSON.stringify({ x: player.x, y: player.y });
    sendSignalingMessage(state);
    // Send state to peers using WebRTC DataChannels
}

// Update game state from peers
function updatePlayerState(id, state) {
    players[id] = state;
    draw();
}
let offset = 0;
function drawBackground() {
    offset += 1;
    if (offset > canvas.width) offset = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(-offset, 0, canvas.width, canvas.height);
    ctx.fillRect(canvas.width - offset, 0, canvas.width, canvas.height);
}


function move(direction) {
    switch(direction) {
      case 'up': player.y -= player.speed; break;
      case 'down': player.y += player.speed; break;
      case 'left': player.x -= player.speed; break;
      case 'right': player.x += player.speed; break;
    }
    sendPlayerState();
  }

function drawSpeedometer() {
const speedCanvas = document.getElementById('speedometer');
const speedCtx = speedCanvas.getContext('2d');
speedCtx.clearRect(0, 0, speedCanvas.width, speedCanvas.height);
speedCtx.beginPath();
speedCtx.arc(100, 50, 40, Math.PI, 2 * Math.PI, false);
speedCtx.strokeStyle = '#333';
speedCtx.lineWidth = 10;
speedCtx.stroke();
    
// Needle to denote speed
const angle = (player.speed / 10) * Math.PI; // Assuming max speed is 10
speedCtx.beginPath();
speedCtx.moveTo(100, 50);
speedCtx.lineTo(100 + 40 * Math.cos(Math.PI + angle), 50 - 40 * Math.sin(Math.PI + angle));
speedCtx.strokeStyle = 'red';
speedCtx.stroke();
}

// Call this in your main update/render function
drawSpeedometer();

draw();

ws.onmessage = async (message) => {
    if (message.data instanceof Blob) {
        const text = await message.data.text();
        try {
            console.log(players)
            const data = JSON.parse(text);
            console.log('Received JSON data', data);
            updatePlayerState(playerId, data)
            // Handle your JSON data here
        } catch (error) {
            console.error('Failed to parse JSON from Blob', error);
        }
    } else {
        console.log('Received non-Blob data', message.data);
    }
};





localConnection.onicecandidate = (event) => {
    if (event.candidate) {
        sendSignalingMessage({ 'iceCandidate': event.candidate });
    }
};

localConnection.ondatachannel = (event) => {
    const receiveChannel = event.channel;
    receiveChannel.onmessage = (event) => {
        console.log('Received Message:', event.data);
    };
};

function handleOffer(offer) {
    localConnection.setRemoteDescription(new RTCSessionDescription(offer));
    localConnection.createAnswer().then(answer => {
        localConnection.setLocalDescription(answer);
        sendSignalingMessage({ 'answer': answer });
    });
}

function handleAnswer(answer) {
    localConnection.setRemoteDescription(new RTCSessionDescription(answer));
}

function handleNewICECandidate(candidate) {
    localConnection.addIceCandidate(new RTCIceCandidate(candidate));
}

function sendSignalingMessage(data) {
    ws.send(JSON.stringify(data));
}
