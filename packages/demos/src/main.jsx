import { createRoot } from "react-dom";
import { useState } from "react";

console.log("createRoot:", createRoot);
const App = () => {
  const [count, setCount] = useState(0);
  window.setCount = setCount;
  return (
    <button
      onClickCapture={() => {
        console.log("onClick");
        setCount((c) => c + 1);
      }}
    >
      {count}
    </button>
  );
};
const root = createRoot(document.getElementById("root"));
root.render(<App />);
