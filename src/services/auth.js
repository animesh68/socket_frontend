const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const TOKEN_KEY = 'clav_token';

export const saveToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

// Sign up (or sign in) with name + email → get JWT back
export const signUp = async (name, email) => {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Sign up failed');
  }

  const data = await res.json();
  saveToken(data.token);
  // returns { _id, name, email }
  return data.user;
};

// Validate stored token, returns user data including _id
export const getMe = async () => {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    clearToken();
    return null;
  }

  const data = await res.json();
  return data.user; // { _id, name, email }
};
