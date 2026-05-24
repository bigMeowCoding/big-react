import { useState } from "react";

function MultiChildrenDemo() {
  const [step, setStep] = useState(0);
  const [showTail, setShowTail] = useState(true);

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
      <button onClick={() => setStep((s) => s + 1)}>切换顺序</button>
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

function LaneDemo() {
  const [num, setNum] = useState(0);

  return (
    <div>
      <h2>lane demo</h2>
      <ul
        onClickCapture={() => {
          setNum((n) => n + 1);
          setNum((n) => n + 1);
          setNum((n) => n + 1);
        }}
      >
        {num}
      </ul>
      <p>点击 ul：一次交互内 3 次 setState，期望 num +3（非 +1）</p>
    </div>
  );
}

function FragmentDemo() {
  const [num, setNum] = useState(0);
  const [showBlock, setShowBlock] = useState(true);

  const arr =
    num % 2 === 0
      ? [
          <li key="1">1</li>,
          <li key="2">2</li>,
          <li key="3">3</li>,
        ]
      : [
          <li key="3">3</li>,
          <li key="2">2</li>,
          <li key="1">1</li>,
        ];

  return (
    <div>
      <h2>fragment demo</h2>
      <button onClick={() => setNum((n) => n + 1)}>切换 arr 顺序</button>
      <button onClick={() => setShowBlock((v) => !v)}>切换 Fragment 显示</button>
      <p>arr 顺序: {num % 2 === 0 ? "1-2-3" : "3-2-1"}</p>
      <ul onClick={() => setNum((n) => n + 1)}>
        <li>4</li>
        <li>5</li>
        {arr}
      </ul>
      <div>
        {showBlock && (
          <>
            <p id="frag-p1">fragment p1</p>
            <p id="frag-p2">fragment p2</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div>
      <MultiChildrenDemo />
      <hr />
      <FragmentDemo />
      <hr />
      <LaneDemo />
    </div>
  );
}
