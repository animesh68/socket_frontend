let socket;

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

export const connectSocket = (username, userId) => {
  const params = new URLSearchParams({ username, userId });
  socket = new WebSocket(`${WS_URL}?${params.toString()}`);

  socket.onopen = () => console.log('Connected to Clav');
  socket.onclose = () => console.log('Disconnected from Clav');
  socket.onerror = (err) => console.error('WebSocket error:', err);

  return socket;
};

export const getSocket = () => socket;

export const isConnected = () => socket && socket.readyState === WebSocket.OPEN;