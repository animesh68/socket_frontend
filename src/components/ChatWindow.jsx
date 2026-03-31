import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

const ChatWindow = ({ messages, currentUser }) => {
    const bottomRef = useRef(null);

    // Auto-scroll to the newest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="chat-window">
            {messages.map((msg, i) => {
                // Render system messages differently
                if (msg.type === "system") {
                    return (
                        <div key={i} className="system-message">
                            {msg.text}
                        </div>
                    );
                }
                return (
                    <MessageBubble
                        key={i}
                        message={msg}
                        isOwn={msg.user === currentUser}
                    />
                );
            })}
            <div ref={bottomRef} />
        </div>
    );
};

export default ChatWindow;