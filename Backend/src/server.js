import 'dotenv/config';  
import app from './app.js';
import http from 'http';
import { initializeSocketServer } from './realtime/sockets.js';

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);
initializeSocketServer(httpServer);
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Now the server can handle both HTTP requests and WebSocket connections