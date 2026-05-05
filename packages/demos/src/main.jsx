import * as React from "react";
import { createRoot } from "react-dom";
import App from "./App";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Cannot find #root container.");
}

const root = createRoot(container);
console.log("root", root);
root.render(<App />);

console.log("Using local workspace react package:", React);
