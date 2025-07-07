import { useState, useRef, useEffect } from "react";
import "../styles/ChatPage.css";
import Sidebar from "../components/Sidebar";
import ChatDisplay from "../components/ChatDisplay";
import InputArea from "../components/InputArea";
import { getQuestionFromRawText } from "../services/Question_services";
import type { Conversation } from "../services/conversation_services";
import { getMessagesByConversationId, createMessageAPI } from "../services/message_services";
import { useParams } from 'react-router-dom';



interface Message {
  sender: "user" | "bot";
  text: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { conversationId } = useParams();
  

  const handleSend = async () => {
  if (!input.trim()) return; // Nếu không có input, không gửi

  const userMessage: Message = { sender: "user", text: input };

  // Thêm tin nhắn người dùng vào UI ngay lập tức
  setMessages((prev) => [...prev, userMessage]);
  setInput(""); // Xoá input sau khi gửi

  try {
    // Gọi API để lưu tin nhắn người dùng vào DB
    await createMessageAPI({
      conversationId: selectedConversation?.id || 0, // Giả sử bạn đang chọn conversation
      role: "user",
      content: input,
    });

    // Gửi câu hỏi đến AI và nhận phản hồi
    const res = await getQuestionFromRawText(input,conversationId);
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

    // Tin nhắn phản hồi từ AI
    const botMessage: Message = { sender: "bot", text: reply };
    setMessages((prev) => [...prev, botMessage]);

    // Lưu tin nhắn AI vào DB
    await createMessageAPI({
      conversationId: selectedConversation?.id || 0,
      role: "model", // AI trả lời
      content: reply,
    });
  } catch (err) {
    console.error("❌ API error:", err);
    const errorMessage: Message = {
      sender: "bot",
      text: "❌ Đã xảy ra lỗi khi xử lý câu hỏi. Vui lòng thử lại.",
    };
    setMessages((prev) => [...prev, errorMessage]);
  }
};


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
  if (conversationId) {
    (async () => {
      try {
        const convId = Number(conversationId);
        console.log("🔗 Loading conversation from URL with id =", convId);
        
        const rawMsgs = await getMessagesByConversationId(convId);
        const displayMsgs = rawMsgs.map((msg) => ({
          sender: msg.role === "user" ? "user" : "bot",
          text: msg.content,
        })) as Message[];

        setMessages(displayMsgs);

        setSelectedConversation({
          id: convId,
          title: `Conversation ${convId}`,
          userId: 0,
          createdAt: "",
          updatedAt: "",
        });

      } catch (err) {
        console.error("❌ Lỗi khi load tin nhắn từ URL:", err);
      }
    })();
  }
}, [conversationId]);


 

  const handleSelectConversation = async (conv: Conversation) => {
    setSelectedConversation(conv);
    try {
      const rawMsgs = await getMessagesByConversationId(conv.id);
      
       const displayMsgs = rawMsgs.map((msg) => ({
    sender: msg.role === "user" ? "user" : "bot",
    text: msg.content,
  })) as Message[];
      setMessages(displayMsgs);
    } catch (err) {
      console.error("❌ Lỗi khi load tin nhắn:", err);
    }
  };

  return (
    <div className="container">
      <div className="main-content">
        <Sidebar onSelectConversation={handleSelectConversation} />
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
