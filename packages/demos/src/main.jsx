import React from "react";
import ReactDOM from "react-dom";
import { jsxDEV } from "react/jsx-dev-runtime";

console.log("React:", React);
console.log("ReactDOM:", ReactDOM);
console.log("jsxDEV:", jsxDEV);
function App() {
  return <div>33344444333</div>;
}
const root = ReactDOM.createRoot?.(document.getElementById("root"));
root?.render(<App />);

console.log("App element:", App());
