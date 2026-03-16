import { useState } from "react";
function App() {
  const [count, setCount] = useState(0);
  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <p>count: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>click me</button>
    </div>
  );
}

export default App;
