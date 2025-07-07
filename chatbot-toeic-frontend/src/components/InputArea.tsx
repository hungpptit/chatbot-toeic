import React, { useRef, useEffect } from "react";


interface InputAreaProps {
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
}

const InputArea: React.FC<InputAreaProps> = ({ input, setInput, handleSend }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 500)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="inputArea">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Nhập câu hỏi..."
        className="input"
        rows={1}
      />
      <button onClick={handleSend} className="button">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.59 5.58L20 12l-8-8-8 8z" />
        </svg>
      </button>
    </div>
  );
};

export default InputArea;
