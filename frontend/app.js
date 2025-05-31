const chatBox = document.getElementById("chat-box");
const inputField = document.getElementById("user-input");

function renderMessage(sender, text) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", sender);
  msgDiv.innerText = text;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function renderWarning(categories) {
  const warnDiv = document.createElement("div");
  warnDiv.classList.add("message", "bot", "warning");

  const categoryList = Object.entries(categories)
    .filter(([_, v]) => v === true)
    .map(([k, _]) => k)
    .join(", ");

  warnDiv.innerText = `⚠️ 안전하지 않은 내용이 포함될 수 있음: ${categoryList}`;
  chatBox.appendChild(warnDiv);
}

function renderSuggestion(suggestion) {
  if (!suggestion) return;
  const suggDiv = document.createElement("div");
  suggDiv.classList.add("message", "bot");
  suggDiv.innerText = `💡 이렇게 바꿔보는 건 어때요?\n👉 ${suggestion}`;
  chatBox.appendChild(suggDiv);
}

function sendMessage() {
  const message = inputField.value.trim();
  if (message === "") return;

  renderMessage("user", message);
  inputField.value = "";

  // ⏳ 타이핑 애니메이션 추가
  const typingIndicator = document.createElement("div");
  typingIndicator.classList.add("message", "bot");
  typingIndicator.id = "typing-indicator";
  typingIndicator.innerText = "입력 중...";
  chatBox.appendChild(typingIndicator);
  chatBox.scrollTop = chatBox.scrollHeight;

  fetch("http://127.0.0.1:8000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: message })
  })
    .then((res) => res.json())
    .then((data) => {
      // ⛔️ 타이핑 제거
      const typingElem = document.getElementById("typing-indicator");
      if (typingElem) typingElem.remove();

      // ✅ 실제 응답 출력
      renderMessage("bot", data.reply);
      if (data.categories && Object.values(data.categories).includes(true)) {
        renderWarning(data.categories);
        renderSuggestion(data.suggestion);
      }
    })
    .catch((err) => {
      const typingElem = document.getElementById("typing-indicator");
      if (typingElem) typingElem.remove();
      renderMessage("bot", "⚠️ 오류가 발생했습니다.");
      console.error(err);
    });
}
extra.push({ sender: "bot", text: `⚠️ 감지된 윤리적 이슈: ${flaggedList}` });
extra.push({ sender: "bot", text: `💡 APE 제안: ${suggestion}` });
extra.push({ sender: "bot", text: `🧠 차단 이유 설명: ${explanation}` });
