import { Server } from "socket.io";
import socketAuthMiddleware from "./authSockets.js";
import registerRoomHandlers from "./rooms.js";
import { isOriginAllowed } from "../Config/cors.js";

export function initializeSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin(origin, callback) {
        if (isOriginAllowed(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error(`Socket CORS blocked for origin: ${origin}`));
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Socket authentication middleware
  io.use(socketAuthMiddleware);

  // Attach event handlers (join/leave/update/presence)
  registerRoomHandlers(io);

  return io;
}

export default initializeSocketServer;


