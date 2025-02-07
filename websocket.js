import { WebSocketServer } from 'ws';

const clients = new Map(); // { userId: ws }

const initializeWebSocket = (server) => {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws, req) => {
        console.log('New client connected');

        ws.on('message', (message) => {
            const data = JSON.parse(message);

            if (data.type === 'register') {
                clients.set(data.userId, ws); // Store user WebSocket
            }
        });

        ws.on('close', () => {
            console.log('Client disconnected');
            clients.forEach((value, key) => {
                if (value === ws) clients.delete(key);
            });
        });
    });

    console.log('WebSocket server initialized');
};

export { clients, initializeWebSocket };

