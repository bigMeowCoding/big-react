import { createRoot } from "react-dom";
import { jsxDEV } from "react/jsx-dev-runtime";

console.log("createRoot:", createRoot);
console.log("jsxDEV:", jsxDEV);
const App = () => {
  return <div>test</div>;
};
const root = createRoot(document.getElementById("root"));
root.render(<App />);
