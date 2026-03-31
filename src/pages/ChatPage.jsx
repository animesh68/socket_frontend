import { useEffect, useState } from "react";
import { connectSocket, getSocket } from "../services/socket";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import InputBox from "../components/InputBox";

const ChatPage = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    if (user) {
      const socket = connectSocket(user.name);

      socket.onopen = () => setConnectionError(false);

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
      };

      socket.onerror = () => setConnectionError(true);
      socket.onclose = () => setConnectionError(true);

      return () => socket.close();
    }
  }, [user]);

  const sendMessage = (text) => {
    if (!user) return;
    const socket = getSocket();
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setConnectionError(true);
      return;
    }

    const msg = {
      user: user.name,
      text,
      time: new Date().toISOString(),
    };

    socket.send(JSON.stringify(msg));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (nameInput.trim() && emailInput.trim()) {
      setUser({ name: nameInput.trim(), email: emailInput.trim() });
    }
  };

  if (!user) {
    return (
      <div className="login-container">
        <form onSubmit={handleLogin} className="login-form">
          <h2>Join ChudTalks</h2>
          <input
            type="text"
            placeholder="Name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar />
      <div className="chat-section">
        {connectionError && (
          <div className="connection-error">
            ⚠️ Unable to connect to the server. Make sure the backend is running.
          </div>
        )}
        <ChatWindow messages={messages} currentUser={user.name} />
        <InputBox sendMessage={sendMessage} />
      </div>
    </div>
  );
};

export default ChatPage;