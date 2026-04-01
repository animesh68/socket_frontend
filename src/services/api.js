import { getToken } from './auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

// Search users by name or email (excludes self)
export const searchUsers = async (q) => {
  if (!q?.trim()) return [];
  const res = await fetch(
    `${API_URL}/users/search?q=${encodeURIComponent(q)}`,
    { headers: authHeaders() }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.users || [];
};

// Fetch general chat history (last 50 messages)
export const getGeneralHistory = async () => {
  const res = await fetch(`${API_URL}/messages/general`, {
    headers: authHeaders(),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.messages || [];
};

// Fetch DM history with a specific user (last 50 messages)
export const getDMHistory = async (userId) => {
  const res = await fetch(`${API_URL}/messages/dm/${userId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.messages || [];
};
