import { useState } from "react";
function App() {
  const [count, setCount] = useState(0);
  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <button onClick={() => setCount((c) => c + 1)}>{count}</button>
    </div>
  );
}

export default App;
