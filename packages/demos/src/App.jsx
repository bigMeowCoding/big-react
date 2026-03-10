import { useState } from "react";
function App() {
  const [count, setCount] = useState(0);
  window.setCount = setCount;
  return <div style={{ padding: 20, fontFamily: "sans-serif" }}>{count}</div>;
}

export default App;
