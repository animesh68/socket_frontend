const MessageBubble = ({message, isOwn}) => {
    return(
        <div className={`message ${isOwn ? "own" : ""}`}>
            <span className="user">{message.user}</span>
            <div className="bubble">{message.text}</div>
        </div>
    );
};

export default MessageBubble;