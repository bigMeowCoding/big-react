import { jsx as jsxFn, jsxDEV as jsxDevFn } from "./src/jsx.js";

export const Fragment = Symbol.for("react.fragment");

export const jsx = jsxFn;
export const jsxs = jsxFn;
export const jsxDEV = jsxDevFn;
