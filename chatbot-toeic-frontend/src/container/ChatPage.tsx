import { useState, useRef, useEffect } from "react";
import "../styles/ChatPage.css";
import Sidebar from "../components/Sidebar";
import ChatDisplay from "../components/ChatDisplay";
import InputArea from "../components/InputArea";

interface Message {
  sender: "user" | "bot";
  text: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");


  const chatEndRef = useRef<HTMLDivElement>(null); // 👈 đặt ở trong chatBox

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input };
    const botReply: Message = {
      sender: "bot",
      text: "Đây là câu trả lời mô phỏng từ chatbot.",
    };

    setMessages((prev) => [...prev, userMessage, botReply]);
    setInput("");
  };

  // ✅ Auto scroll trong .chatBox
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  return (
    <div className="container">
      {/* <Header activeTab={activeTab} onChangeTab={handleChangeTab} /> */}
      <div className="main-content">
        <Sidebar />
        <div className="chat-area">
          <div className="chat-title">Chatbot TOEIC</div>
          <div className="chatBox">
            <ChatDisplay messages={messages} />
            <div ref={chatEndRef} style={{ height: "1px" }} />
          </div>
          <InputArea input={input} setInput={setInput} handleSend={handleSend} />
        </div>
      </div>
    </div>
  );
}
