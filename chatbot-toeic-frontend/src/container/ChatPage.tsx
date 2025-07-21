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
  const [showSidebar, setShowSidebar] = useState(true);

  

  const handleSend = async () => {
  if (!input.trim()) return; // Nếu không có input, không gửi
  if (!selectedConversation || !selectedConversation.id) {
    setMessages((prev) => [...prev, { sender: "bot", text: "❌ Bạn chưa chọn đoạn chat!" }]);
    return;
  }
  const userMessage: Message = { sender: "user", text: input };
  setMessages((prev) => [...prev, userMessage]);
  setInput("");
  try {
    await createMessageAPI({
      conversationId: selectedConversation.id,
      role: "user",
      content: input,
    });
    const res = await getQuestionFromRawText(input, conversationId);
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
    await createMessageAPI({
      conversationId: selectedConversation.id,
      role: "model",
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
    if (!conversationId || isNaN(Number(conversationId))) {
      setMessages([]);
      setSelectedConversation(null);
      return;
    }
    (async () => {
      try {
        const convId = Number(conversationId);
        const rawMsgs = await getMessagesByConversationId(convId);
        if (!rawMsgs || rawMsgs.length === 0) {
          setMessages([]);
        } else {
          const displayMsgs = rawMsgs.map((msg) => ({
            sender: msg.role === "user" ? "user" : "bot",
            text: msg.content,
          })) as Message[];
          setMessages(displayMsgs);
        }
        // Luôn chọn đoạn chat mới khi URL thay đổi
        setSelectedConversation(prev => {
          if (prev && prev.id === convId) return prev;
          return {
            id: convId,
            title: `Conversation ${convId}`,
            userId: 0,
            createdAt: "",
            updatedAt: "",
          };
        });
      } catch (err) {
        console.error("❌ Lỗi khi load tin nhắn từ URL:", err);
      }
    })();
  }, [conversationId]);

  // Tự động load tin nhắn khi selectedConversation thay đổi
  useEffect(() => {
    if (selectedConversation) {
      (async () => {
        try {
          const rawMsgs = await getMessagesByConversationId(selectedConversation.id);
          if (!rawMsgs || rawMsgs.length === 0) {
            setMessages([]);
          } else {
            const displayMsgs = rawMsgs.map((msg) => ({
              sender: msg.role === "user" ? "user" : "bot",
              text: msg.content,
            })) as Message[];
            setMessages(displayMsgs);
          }
        } catch (err) {
          console.error("❌ Lỗi khi load tin nhắn:", err);
        }
      })();
    }
  }, [selectedConversation]);


 

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
  
    <div className="main-home">
       
        <Sidebar
          show={showSidebar}
          setShow={setShowSidebar}
          onSelectConversation={handleSelectConversation}
        />
    

      <div className={`chat-area ${showSidebar ? "sidebar-open" : "sidebar-minimized"}`}>
        <div className="chat-title">Chatbot TOEIC</div>

        <div className="chatBox">
          <ChatDisplay messages={messages} />
          <div ref={chatEndRef} />
        </div>
          <InputArea input={input} setInput={setInput} handleSend={handleSend} />
      </div>
    </div>

  
  );
}
