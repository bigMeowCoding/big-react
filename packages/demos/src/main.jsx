import React from "react";
import { createRoot } from "react-dom";
import { jsxDEV } from "react/jsx-dev-runtime";

console.log("React:", React);
console.log("createRoot:", createRoot);
console.log("jsxDEV:", jsxDEV);
const jsx = <div>33344444333</div>;
const root = createRoot(document.getElementById("root"));
root.render(jsx);

