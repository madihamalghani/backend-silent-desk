// import dotenv from 'dotenv';
// import app from './app.js';
// dotenv.config({ path: './config/config.env' });

// console.log("Loaded PORT:", process.env.PORT); // Debugging line

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });
import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
import { initializeWebSocket } from './websocket.js';

dotenv.config({ path: './config/config.env' });

console.log("Loaded PORT:", process.env.PORT); // Debugging line

const PORT = process.env.PORT || 3000;
const server = http.createServer(app); // Create an HTTP server for WebSocket

// Initialize WebSocket
initializeWebSocket(server);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
