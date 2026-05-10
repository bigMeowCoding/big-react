import { useState } from "react";

function createInitialCount() {
  console.log("[demo] createInitialCount called");
  return 0;
}

export default function App() {
  const [count, setCount] = useState(createInitialCount);

  const handleSetCountDirectly = () => {
    setCount(count + 1);
  };

  return <button onClick={handleSetCountDirectly}>{count}</button>;
}
