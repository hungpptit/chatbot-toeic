import React from "react";

interface Message {
  sender: "user" | "bot";
  text: string;
}

interface ChatDisplayProps {
  messages: Message[];
}

const ChatDisplay: React.FC<ChatDisplayProps> = ({ messages }) => {
  return (
    <div className="chatBox">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`message ${msg.sender === "user" ? "user" : "bot"}`}
          style={{ whiteSpace: "pre-wrap" }}  // 👈 Giữ định dạng như input
        >
          {msg.text}
        </div>
      ))}
    </div>
  );
};

export default ChatDisplay;