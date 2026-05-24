import { describe, expect, it } from "vitest";
import {
  createUpdate,
  createUpdateQueue,
  enqueueUpdate,
  processUpdateQueue,
} from "../updateQueue.js";

describe("updateQueue", () => {
  describe("createUpdate", () => {
    it("创建包含 action 的 update 对象", () => {
      const update = createUpdate(42);
      expect(update).toEqual({ action: 42 });
    });
  });

  describe("enqueueUpdate", () => {
    it("将 update 写入 shared.pending", () => {
      const queue = createUpdateQueue();
      const update = createUpdate("a");

      enqueueUpdate(queue, update);

      expect(queue.shared.pending).toBe(update);
    });

    it("后入队的 update 覆盖前一个 pending", () => {
      const queue = createUpdateQueue();
      enqueueUpdate(queue, createUpdate(1));
      enqueueUpdate(queue, createUpdate(2));

      expect(queue.shared.pending.action).toBe(2);
    });
  });

  describe("processUpdateQueue", () => {
    it("pending 为 null 时返回 baseState", () => {
      const queue = createUpdateQueue();
      expect(processUpdateQueue(0, queue)).toBe(0);
    });

    it("消费直赋 update 并清空 pending", () => {
      const queue = createUpdateQueue();
      enqueueUpdate(queue, createUpdate(10));

      const nextState = processUpdateQueue(0, queue);

      expect(nextState).toBe(10);
      expect(queue.shared.pending).toBeNull();
    });

    it("消费 functional update", () => {
      const queue = createUpdateQueue();
      enqueueUpdate(queue, createUpdate((n) => n + 1));

      expect(processUpdateQueue(3, queue)).toBe(4);
    });

    it("queue 为 null 时返回 baseState", () => {
      expect(processUpdateQueue(5, null)).toBe(5);
    });
  });
});
