// src/components/ChatBubble.jsx

import React from "react";

function ChatBubble({ sender, text }) {
  // 1) sender 값에 따라 기본 클래스 부여
  //    user → "message user"   (오른쪽 정렬)
  //    bot  → "message bot"    (왼쪽 정렬)
  let className = sender === "user" ? "message user" : "message bot";

  // 2) text가 문자열(String)인지 확인한 뒤, APE 경고·제안·설명 분기
  if (typeof text === "string") {
    if (text.startsWith("⚠️")) className += " warning";
    if (text.startsWith("💡")) className += " suggestion";
    if (text.startsWith("🧠")) className += " explanation";
  }

  // 3) 반드시 .bubble로 감싸야 CSS .bubble { … }이 적용됩니다
  return (
    <div className={className}>
      <div className="bubble">{text}</div>
    </div>
  );
}

export default ChatBubble;
