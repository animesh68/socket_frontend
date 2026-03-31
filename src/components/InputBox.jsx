import {useState} from "react";

const InputBox = ({sendMessage}) => {
    const [text , setText] = useState("");

    const handleSend = () => {
        if(!text.trim()) return;
        sendMessage(text);
        setText("");
    };

    return (
        <div className="input-box">
            <input
            value={text}
            onChange = {(e) => setText(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend}>Send</button>
        </div>
    );
};

export default InputBox;