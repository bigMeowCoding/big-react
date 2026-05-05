import { useState } from "react";

function createInitialCount() {
  console.log("[demo] createInitialCount called");
  return 0;
}

export default function App() {
  const [count, setCount] = useState(createInitialCount);
  const [text, setText] = useState("hello hook");

  console.log("[demo] App render", { count, text });

  const handleSetCountDirectly = () => {
    setCount(count + 1);
  };

  const handleSetCountByUpdater = () => {
    setCount((prev) => prev + 1);
  };

  const handleSetText = () => {
    setText(`hello hook ${Date.now()}`);
  };

  return (
    <div>
      <button onClick={handleSetText}>setText(...)</button>
    </div>
  );
}
