import { createRoot } from "react-dom";
import { useState } from "react";
import { jsxDEV } from "react/jsx-dev-runtime";

console.log("createRoot:", createRoot);
console.log("jsxDEV:", jsxDEV);
const App = () => {
  const [count, setCount] = useState(0);
  window.setCount = setCount;
  return (
    <button
      onClick={() => {
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
