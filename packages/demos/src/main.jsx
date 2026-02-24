import { createRoot } from "react-dom";
import { useState } from "react";

console.log("createRoot:", createRoot);
const App = () => {
  const [count, setCount] = useState(0);
  window.setCount = setCount;

  const handleParentClick = () => {
    console.log("[parent] click");
  };

  
  const handleChildClickNoStop = () => {
    console.log("[child] click (no stop)");
    setCount((c) => c + 1);
  };

  const handleChildClickWithStop = (e) => {
    console.log("[child] click (with stopPropagation)");
    e.stopPropagation();
    setCount((c) => c + 1);
  };

  return (
    <div onClick={handleParentClick}>
      <p>count: {count}</p>
      <button onClick={handleChildClickNoStop}>
        点我（不阻止冒泡）
      </button>
      <button onClick={handleChildClickWithStop} style={{ marginLeft: 8 }}>
        点我（阻止冒泡）
      </button>
    </div>
  );
};
const root = createRoot(document.getElementById("root"));
root.render(<App />);
