import { useEffect, useState, useRef, useCallback } from "react";
import { connectSocket, getSocket } from "../services/socket";
import { signUp, getMe, clearToken } from "../services/auth";
import { getGeneralHistory, getDMHistory } from "../services/api";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ChatHeader from "../components/ChatHeader";
import InputBox from "../components/InputBox";

const ChatPage = () => {
  const [user, setUser] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [connectionError, setConnectionError] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  // Chat state
  const [activeChat, setActiveChat] = useState({ type: "general" });
  const [chatMessages, setChatMessages] = useState({}); // keyed by chatId
  const [chatLoading, setChatLoading] = useState(false);
  const [dmConversations, setDmConversations] = useState([]); // sidebar DM list
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer

  const activeChatRef = useRef(activeChat); // always up-to-date in WS handler
  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);

  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  // Helper: stable chat key from activeChat
  const getChatKey = (chat) =>
    chat.type === "general" ? "general" : `dm_${chat.user._id}`;

  // Add a message to a specific chat slot
  const appendTo = useCallback((chatKey, msg) => {
    setChatMessages((prev) => ({
      ...prev,
      [chatKey]: [...(prev[chatKey] || []), msg],
    }));
  }, []);

  // ── Auto-login on mount ──────────────────────────────────────────────────
  useEffect(() => {
    const tryAutoLogin = async () => {
      const savedUser = await getMe();
      if (savedUser) setUser(savedUser);
      setAuthLoading(false);
    };
    tryAutoLogin();
  }, []);

  // ── Connect WebSocket once user is known ─────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const socket = connectSocket(user.name, user._id);

    socket.onopen = () => setConnectionError(false);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const current = activeChatRef.current;
      const me = userRef.current;

      if (data.type === "system") {
        // Show system messages only in general
        if (current.type === "general") {
          appendTo("general", data);
        }
        return;
      }

      if (data.type === "general") {
        appendTo("general", data);
        return;
      }

      if (data.type === "dm") {
        // Determine the other person
        const otherId = data.from === me?._id ? data.to : data.from;
        const otherName = data.from === me?._id ? data.to : data.fromName;
        const dmKey = `dm_${otherId}`;

        appendTo(dmKey, data);

        // If they're not in our sidebar list yet, add them
        setDmConversations((prev) => {
          if (prev.some((c) => c._id === otherId)) return prev;
          return [{ _id: otherId, name: otherName }, ...prev];
        });
      }
    };

    socket.onerror = () => setConnectionError(true);
    socket.onclose = () => setConnectionError(true);

    return () => socket.close();
  }, [user, appendTo]);

  // ── Load history when active chat changes ────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const chatKey = getChatKey(activeChat);
    // Already loaded — don't re-fetch
    if (chatMessages[chatKey]) return;

    const loadHistory = async () => {
      setChatLoading(true);
      try {
        let history = [];
        if (activeChat.type === "general") {
          history = await getGeneralHistory();
        } else {
          history = await getDMHistory(activeChat.user._id);
        }
        setChatMessages((prev) => ({ ...prev, [chatKey]: history }));
      } catch (e) {
        console.error("Failed to load history:", e);
      } finally {
        setChatLoading(false);
      }
    };

    loadHistory();
  }, [activeChat, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Send message ─────────────────────────────────────────────────────────
  const sendMessage = (text) => {
    if (!user || !text.trim()) return;
    const socket = getSocket();
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setConnectionError(true);
      return;
    }

    if (activeChat.type === "general") {
      socket.send(JSON.stringify({ type: "general", text }));
    } else {
      socket.send(JSON.stringify({
        type: "dm",
        to: activeChat.user._id,
        text,
      }));
    }
  };

  // ── Select a chat (from sidebar) ─────────────────────────────────────────
  const handleChatSelect = (chat) => {
    setActiveChat(chat);

    // Ensure the DM appears in sidebar immediately
    if (chat.type === "dm") {
      setDmConversations((prev) => {
        if (prev.some((c) => c._id === chat.user._id)) return prev;
        return [{ _id: chat.user._id, name: chat.user.name }, ...prev];
      });
    }
  };

  // ── Login ────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      const loggedInUser = await signUp(nameInput.trim(), emailInput.trim());
      setUser(loggedInUser);
    } catch (err) {
      setAuthError(err.message || "Something went wrong. Try again.");
    }
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = () => {
    clearToken();
    setUser(null);
    setChatMessages({});
    setDmConversations([]);
    setActiveChat({ type: "general" });
    setNameInput("");
    setEmailInput("");
  };

  // ── Render ───────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="login-container">
        <div className="auth-loading">
          <div className="auth-spinner" />
          <p>Checking session…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="login-container">
        <form onSubmit={handleLogin} className="login-form">
          <h2>Join Clav</h2>
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
          {authError && <p className="auth-error">{authError}</p>}
          <button type="submit">Join Chat</button>
        </form>
      </div>
    );
  }

  const chatKey = getChatKey(activeChat);
  const currentMessages = chatMessages[chatKey] || [];

  return (
    <div className="app">
      <Sidebar
        user={user}
        activeChat={activeChat}
        onChatSelect={handleChatSelect}
        dmConversations={dmConversations}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="chat-section">
        <ChatHeader activeChat={activeChat} onMenuToggle={() => setSidebarOpen(true)} />
        {connectionError && (
          <div className="connection-error">
            ⚠️ Unable to connect to the server. Make sure the backend is running.
          </div>
        )}
        <ChatWindow
          messages={currentMessages}
          currentUser={user.name}
          loading={chatLoading}
        />
        <InputBox sendMessage={sendMessage} />
      </div>
    </div>
  );
};

export default ChatPage;