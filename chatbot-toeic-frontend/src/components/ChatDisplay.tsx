import React from "react";
import ReactMarkdown from "react-markdown";


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
        msg.sender === "bot" ? (
          <div key={idx} className="message bot" style={{ whiteSpace: "pre-wrap" }}>
           <ReactMarkdown
            components={{
              p: ({ node, ...props }) => <p className="markdown-p" {...props} />,
              ul: ({ node, ...props }) => <ul className="markdown-ul" {...props} />,
              li: ({ node, ...props }) => <li className="markdown-li" {...props} />,
              strong: ({ node, ...props }) => <strong className="markdown-strong" {...props} />,
            }}
          >
            {msg.text}
          </ReactMarkdown>
          </div>
        ) : (
          <div key={idx} className="message user" style={{ whiteSpace: "pre-wrap" }}>
            {msg.text}
          </div>
        )
      ))}
    </div>
  );
};

export default ChatDisplay;