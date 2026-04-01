import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

const ChatWindow = ({ messages, currentUser, loading }) => {
  const bottomRef = useRef(null);

  // Auto-scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return (
      <div className="chat-window chat-window-loading">
        <div className="auth-spinner" />
      </div>
    );
  }

  return (
    <div className="chat-window">
      {messages.length === 0 && (
        <div className="chat-empty">
          <p>No messages yet. Say something! 👋</p>
        </div>
      )}
      {messages.map((msg, i) => {
        if (msg.type === "system") {
          return (
            <div key={i} className="system-message">
              {msg.text}
            </div>
          );
        }
        // Normalize both DB history messages and live WS messages
        const senderName = msg.senderName || msg.user || msg.fromName;
        return (
          <MessageBubble
            key={i}
            message={{ ...msg, user: senderName }}
            isOwn={senderName === currentUser}
          />
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatWindow;