import React, { useState } from "react";

function ChatInput({ onSend }) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() !== "") {
      onSend(input);
      setInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    // ⚠️ CSS 클래스명이 아래와 일치해야 스타일이 적용됩니다.
    <div className="chat-input-container">
      <input
        type="text"
        placeholder="메시지를 입력하세요..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleSend}>전송</button>
    </div>
  );
}

export default ChatInput;
