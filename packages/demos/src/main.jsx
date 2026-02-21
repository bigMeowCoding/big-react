import React from "react";
import ReactDOM from "react-dom";

console.log("React:", React);
console.log("ReactDOM:", ReactDOM);

const App = () => {
  return <div>Big React Demos</div>;
};

// TODO: 当 react-dom 实现 createRoot 后替换为：
// ReactDOM.createRoot(document.getElementById("root")).render(<App />);

const root = document.getElementById("root");
root.innerHTML = "<h1>Big React Demos</h1><p>React 和 ReactDOM 已加载，请打开控制台查看输出。</p>";
