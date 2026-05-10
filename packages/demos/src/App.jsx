import { useState } from "react";

export default function App() {
  const [step, setStep] = useState(0);
  const [showTail, setShowTail] = useState(true);

  const handleToggleOrder = () => {
    setStep((s) => s + 1);
  };

  const shouldReverse = step % 2 === 1;
  const baseItems = shouldReverse
    ? [
        { key: "c", label: "C" },
        { key: "a", label: "A" },
        { key: "b", label: "B" },
      ]
    : [
        { key: "a", label: "A" },
        { key: "b", label: "B" },
        { key: "c", label: "C" },
      ];

  const items = showTail
    ? [...baseItems, { key: "tail", label: `TAIL-${step}` }]
    : baseItems;

  return (
    <div>
      <h2>multi children demo</h2>
      <button onClick={handleToggleOrder}>切换顺序</button>
      <button onClick={() => setShowTail((v) => !v)}>切换尾节点</button>
      <p>当前顺序: {shouldReverse ? "C-A-B" : "A-B-C"}</p>
      <ul>
        {items.map((item) => (
          <li key={item.key}>{item.label}</li>
        ))}
      </ul>
    </div>
  );
}
