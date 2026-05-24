import { describe, expect, it } from "vitest";
import {
  REACT_ELEMENT_TYPE,
  REACT_FRAGMENT_TYPE,
} from "../ReactSymbols.js";

describe("ReactSymbols", () => {
  it("REACT_ELEMENT_TYPE 与 Symbol.for('react.element') 一致", () => {
    expect(REACT_ELEMENT_TYPE).toBe(Symbol.for("react.element"));
  });

  it("REACT_FRAGMENT_TYPE 与 Symbol.for('react.fragment') 一致", () => {
    expect(REACT_FRAGMENT_TYPE).toBe(Symbol.for("react.fragment"));
  });

  it("Element 与 Fragment 使用不同 Symbol", () => {
    expect(REACT_ELEMENT_TYPE).not.toBe(REACT_FRAGMENT_TYPE);
  });
});
