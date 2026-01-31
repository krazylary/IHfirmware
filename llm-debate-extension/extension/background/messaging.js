// background/messaging.js

let socket = null;
let isConnected = false;
const SERVER_URL = 'ws://localhost:3000';

// Connect to Localhost Server
function connectServer() {
  if (socket) {
    socket.close();
  }

  socket = new WebSocket(SERVER_URL);

  socket.onopen = () => {
    console.log('Connected to Localhost Server');
    isConnected = true;
    socket.send(JSON.stringify({ type: 'REGISTER_EXTENSION' }));
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      handleServerMessage(message);
    } catch (e) {
      console.error('Failed to parse server message', e);
    }
  };

  socket.onclose = () => {
    console.log('Disconnected from Localhost Server');
    isConnected = false;
    // Retry connection after 5 seconds
    setTimeout(connectServer, 5000);
  };

  socket.onerror = (err) => {
    console.error('WebSocket error:', err);
  };
}

function handleServerMessage(message) {
  console.log('Received from server:', message);
  if (message.type === 'REPLAY_ROUND') {
    // Dispatch via broadcast or custom event if needed
  }
}

export function sendToServer(type, payload) {
  if (isConnected && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type, payload }));
  }
}

// Internal Messaging
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.target === 'SERVER') {
    sendToServer(request.type, request.payload);
  }
  return true;
});

// Initialize connection
connectServer();
