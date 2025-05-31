import { useState } from "react";
import axios from "axios";
import ChatBubble from "./components/ChatBubble";
import ChatInput from "./components/ChatInput";
import TypingIndicator from "./components/TypingIndicator";

// ▶️ 반드시 이 줄 그대로 두셔야 styles/app.css가 정상 로드됩니다.
import "./styles/app.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);

  const handleSend = async (msg) => {
    // 1) 사용자 메시지(파란말풍선)를 화면에 추가
    const userMsg = { sender: "user", text: msg };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    try {
      // 2) 백엔드(예: FastAPI)로 POST 요청
      const res = await axios.post("http://127.0.0.1:8000/chat", {
        message: msg,
      });

      // 3) 백엔드 응답( reply, categories, suggestion, explanation )을 비구조화
      const { reply, categories, suggestion, explanation } = res.data;

      // 4) 봇 일반 답변(회색 말풍선)
      const botReply = { sender: "bot", text: reply };
      const extra = [];

      // 5) 윤리 감지(Category)가 있으면 경고 메시지(노란 말풍선)
      if (categories && Object.values(categories).includes(true)) {
        const flaggedList = Object.entries(categories)
          .filter(([_, v]) => v === true)
          .map(([k]) => k)
          .join(", ");
        extra.push({
          sender: "bot",
          text: `⚠️ 감지된 윤리적 이슈: ${flaggedList}`,
        });
      }

      // 6) APE 제안(하늘색 말풍선)
      if (suggestion) {
        extra.push({
          sender: "bot",
          text: `💡 APE 제안: ${suggestion}`,
        });
      }

      // 7) 차단 이유 설명(분홍 말풍선)
      if (explanation) {
        extra.push({
          sender: "bot",
          text: `🧠 차단 이유 설명: ${explanation}`,
        });
      }

      // 8) 화면에 봇 답변 + (경고/제안/설명) 메시지들을 순차적으로 추가
      setMessages((prev) => [...prev, botReply, ...extra]);
    } catch (e) {
      // 오류가 난 경우, 에러 표시 말풍선
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ 오류가 발생했습니다." },
      ]);
      console.error(e);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((msg, i) => (
          <ChatBubble key={i} sender={msg.sender} text={msg.text} />
        ))}
        {typing && <TypingIndicator />}
      </div>
      <ChatInput onSend={handleSend} />
    </div>
  );
}

export default App;
