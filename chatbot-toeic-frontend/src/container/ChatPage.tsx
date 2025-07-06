import { useState, useRef, useEffect } from "react";
import "../styles/ChatPage.css";
import Sidebar from "../components/Sidebar";
import ChatDisplay from "../components/ChatDisplay";
import InputArea from "../components/InputArea";
import { getQuestionFromRawText } from "../services/Question_services";

interface Message {
  sender: "user" | "bot";
  text: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 🔁 Khôi phục conversationId nếu đã có trong localStorage
  useEffect(() => {
    const stored = localStorage.getItem("conversationId");
    if (stored) setConversationId(stored);
  }, []);

  // 👇 Scroll xuống khi có tin nhắn mới
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const testConversationId = "6";
      console.log("📤 Sending to BE:", input, testConversationId);
      const res = await getQuestionFromRawText(input, testConversationId);

      // ✅ Lưu lại conversationId nếu được backend trả về
      if (res.conversationId) {
        setConversationId(res.conversationId);
        localStorage.setItem("conversationId", res.conversationId);
      }

      // 🧠 Soạn nội dung phản hồi
      let reply = "";

      if (res.type === "Vocabulary-Lookup") {
        reply += `🔤 Từ: ${res.word}\n`;
        reply += `• Định nghĩa: ${res.definition}\n`;
        reply += `• Ví dụ: ${res.example}\n`;
        if (res.synonyms?.length) reply += `• Đồng nghĩa: ${res.synonyms.join(", ")}\n`;
        if (res.antonyms?.length) reply += `• Trái nghĩa: ${res.antonyms.join(", ")}\n`;
        if (res.viExplanation) reply += `• Giải thích TV: ${res.viExplanation}`;
      } else if (res.type === "Free") {
        reply = `💬 Trả lời: ${res.answer}`;
      } else {
        reply += `❓ ${res.question}\n`;
        for (const [key, val] of Object.entries(res.options || {})) {
          reply += `  ${key}. ${val}\n`;
        }
        reply += `✅ Đáp án: ${res.answer}\n`;
        reply += `🧠 Giải thích: ${res.explanation}`;
      }

      const botMessage: Message = { sender: "bot", text: reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("❌ API error:", err);
      const errorMessage: Message = {
        sender: "bot",
        text: "❌ Đã xảy ra lỗi khi xử lý câu hỏi. Vui lòng thử lại.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="container">
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
