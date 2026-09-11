import { io, Socket } from "socket.io-client";

// Connect to backend server (or same-origin via dev proxy)
const SOCKET_URL = import.meta.env["VITE_BACKEND_URL"] || "http://localhost:5000";

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ["websocket", "polling"],
});
