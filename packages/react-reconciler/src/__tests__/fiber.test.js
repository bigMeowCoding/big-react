import { describe, expect, it } from "vitest";
import {
  FiberNode,
  createWorkInProgress,
  createFiberFromElement,
  createFiberFromFragment,
} from "../fiber.js";
import { Fragment, HostComponent, FunctionComponent } from "../workTags.js";
import { REACT_ELEMENT_TYPE, REACT_FRAGMENT_TYPE } from "shared/ReactSymbols";

describe("fiber", () => {
  describe("createWorkInProgress", () => {
    it("首次创建 alternate 双缓冲节点", () => {
      const current = new FiberNode(HostComponent, { id: "a" }, null);
      current.type = "div";
      current.memoizedProps = { id: "a" };

      const wip = createWorkInProgress(current, { id: "b" });

      expect(wip).not.toBe(current);
      expect(wip.alternate).toBe(current);
      expect(current.alternate).toBe(wip);
      expect(wip.pendingProps).toEqual({ id: "b" });
      expect(wip.memoizedProps).toEqual({ id: "a" });
    });

    it("复用已有 alternate", () => {
      const current = new FiberNode(HostComponent, { id: "a" }, null);
      const firstWip = createWorkInProgress(current, { id: "b" });
      const secondWip = createWorkInProgress(current, { id: "c" });

      expect(secondWip).toBe(firstWip);
      expect(secondWip.pendingProps).toEqual({ id: "c" });
    });
  });

  describe("createFiberFromElement", () => {
    it("DOM 元素创建 HostComponent Fiber", () => {
      const element = {
        $$typeof: REACT_ELEMENT_TYPE,
        type: "span",
        key: "k1",
        props: { className: "x" },
      };
      const fiber = createFiberFromElement(element);

      expect(fiber.tag).toBe(HostComponent);
      expect(fiber.type).toBe("span");
      expect(fiber.key).toBe("k1");
      expect(fiber.pendingProps).toEqual({ className: "x" });
    });

    it("函数组件创建 FunctionComponent Fiber", () => {
      function Comp() {}
      const element = {
        $$typeof: REACT_ELEMENT_TYPE,
        type: Comp,
        key: null,
        props: {},
      };
      const fiber = createFiberFromElement(element);

      expect(fiber.tag).toBe(FunctionComponent);
      expect(fiber.type).toBe(Comp);
    });
  });

  describe("createFiberFromFragment", () => {
    it("pendingProps 直接存 children 数组", () => {
      const children = ["a", "b"];
      const fiber = createFiberFromFragment(children, "frag-key");

      expect(fiber.tag).toBe(Fragment);
      expect(fiber.pendingProps).toBe(children);
      expect(fiber.key).toBe("frag-key");
      expect(fiber.type).toBeNull();
    });
  });
});
