import { useState } from "react";
import "../styles/ChatPage.css";

interface Message {
  sender: "user" | "bot";
  text: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    // Giả lập trả lời từ bot — bạn thay bằng API thật
    const botReply: Message = {
      sender: "bot",
      text: "Đây là câu trả lời mô phỏng từ chatbot.",
    };
    setMessages((prev) => [...prev, botReply]);
    setInput("");
  };

  return (
    <div className="container">
      <h1 className="title">Chatbot TOEIC</h1>
      <div className="chatBox">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.sender === "user" ? "user" : "bot"}`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="inputArea">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập câu hỏi..."
          className="input"
        />
        <button onClick={handleSend} className="button">
          Gửi
        </button>
      </div>
    </div>
  );
}
