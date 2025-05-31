import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // (빈 파일이므로 없어도 무방하지만, Vite가 자동 참조함)

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
