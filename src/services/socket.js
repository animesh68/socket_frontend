let socket;

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

export const connectSocket = (username) => {
    socket = new WebSocket(`${WS_URL}?username=${encodeURIComponent(username)}`);

    socket.onopen = () => console.log("Connected to ChudTalks");
    socket.onclose = () => console.log("Disconnected from ChudTalks");
    socket.onerror = (err) => console.error("WebSocket error:", err);

    return socket;
};

export const getSocket = () => socket;

export const isConnected = () => socket && socket.readyState === WebSocket.OPEN;