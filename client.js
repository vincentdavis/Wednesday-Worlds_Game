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

document.getElementById('connect').addEventListener('click', () => {
    localConnection.createOffer().then(offer => {
        localConnection.setLocalDescription(offer);
        sendSignalingMessage({ 'offer': offer });
    });
});

document.getElementById('disconnect').addEventListener('click', () => {
    localConnection.close();
    ws.close();
});

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
