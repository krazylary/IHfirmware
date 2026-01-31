const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 3000;
const STORAGE_DIR = path.join(__dirname, 'storage');

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR);
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store active connections
let dashboardClients = [];
let extensionClient = null;

// Debate State Management
let currentDebateId = null;
let currentDebateState = {};

// Helper: Save Debate State
const saveDebateState = (debateId, state) => {
  const filepath = path.join(STORAGE_DIR, `debate_${debateId}.json`);
  fs.writeFileSync(filepath, JSON.stringify(state, null, 2));
};

// WebSocket Connection Handling
wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      handleMessage(ws, parsedMessage);
    } catch (e) {
      console.error('Error parsing message:', e);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    dashboardClients = dashboardClients.filter(client => client !== ws);
    if (extensionClient === ws) {
      extensionClient = null;
    }
  });
});

const handleMessage = (ws, message) => {
  const { type, payload } = message;

  switch (type) {
    case 'REGISTER_EXTENSION':
      extensionClient = ws;
      console.log('Extension registered');
      break;

    case 'REGISTER_DASHBOARD':
      dashboardClients.push(ws);
      console.log('Dashboard registered');
      // Send current state to new dashboard
      if (currentDebateId && Object.keys(currentDebateState).length > 0) {
        ws.send(JSON.stringify({ type: 'STATE_UPDATE', payload: currentDebateState }));
      }
      break;

    case 'DEBATE_UPDATE':
      // Received update from extension
      console.log('Received debate update', payload);
      if (!currentDebateId) {
        currentDebateId = payload.debateId || `debate_${Date.now()}`;
      }
      currentDebateState = payload;
      saveDebateState(currentDebateId, currentDebateState);

      // Broadcast to dashboards
      dashboardClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'STATE_UPDATE', payload: currentDebateState }));
        }
      });
      break;

    case 'REPLAY_ROUND':
      // Dashboard requested replay
      if (extensionClient && extensionClient.readyState === WebSocket.OPEN) {
        extensionClient.send(JSON.stringify({ type: 'REPLAY_ROUND', payload }));
      }
      break;

    default:
      console.log('Unknown message type:', type);
  }
};

// REST API for Dashboard
app.get('/api/debates', (req, res) => {
  const files = fs.readdirSync(STORAGE_DIR).filter(f => f.startsWith('debate_') && f.endsWith('.json'));
  const debates = files.map(f => {
    const content = JSON.parse(fs.readFileSync(path.join(STORAGE_DIR, f)));
    return {
      id: f.replace('debate_', '').replace('.json', ''),
      timestamp: content.timestamp || fs.statSync(path.join(STORAGE_DIR, f)).mtime,
      topic: content.topic || 'Unknown Topic'
    };
  });
  res.json(debates);
});

app.get('/api/debates/:id', (req, res) => {
  const filepath = path.join(STORAGE_DIR, `debate_${req.params.id}.json`);
  if (fs.existsSync(filepath)) {
    res.json(JSON.parse(fs.readFileSync(filepath)));
  } else {
    res.status(404).send('Debate not found');
  }
});

server.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
