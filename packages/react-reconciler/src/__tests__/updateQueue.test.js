import { describe, expect, it } from "vitest";
import { SyncLane } from "../fiberLanes.js";
import {
  createUpdate,
  createUpdateQueue,
  enqueueUpdate,
  processUpdateQueue,
} from "../updateQueue.js";

describe("updateQueue", () => {
  describe("createUpdate", () => {
    it("创建包含 action、lane、next 的 update 对象", () => {
      const update = createUpdate(42, SyncLane);
      expect(update).toEqual({ action: 42, lane: SyncLane, next: null });
    });
  });

  describe("enqueueUpdate", () => {
    it("首个 update 形成自环", () => {
      const queue = createUpdateQueue();
      const update = createUpdate("a", SyncLane);

      enqueueUpdate(queue, update);

      expect(queue.shared.pending).toBe(update);
      expect(update.next).toBe(update);
    });

    it("多个 update 形成环形链表", () => {
      const queue = createUpdateQueue();
      const first = createUpdate(1, SyncLane);
      const second = createUpdate(2, SyncLane);
      const third = createUpdate(3, SyncLane);

      enqueueUpdate(queue, first);
      enqueueUpdate(queue, second);
      enqueueUpdate(queue, third);

      expect(queue.shared.pending).toBe(third);
      expect(third.next).toBe(first);
      expect(first.next).toBe(second);
      expect(second.next).toBe(third);
    });
  });

  describe("processUpdateQueue", () => {
    it("pending 为 null 时返回 baseState", () => {
      expect(processUpdateQueue(0, null, SyncLane)).toEqual({
        memoizedState: 0,
      });
    });

    it("消费直赋 update", () => {
      const queue = createUpdateQueue();
      enqueueUpdate(queue, createUpdate(10, SyncLane));

      const { memoizedState } = processUpdateQueue(
        0,
        queue.shared.pending,
        SyncLane
      );

      expect(memoizedState).toBe(10);
    });

    it("批量消费 functional update", () => {
      const queue = createUpdateQueue();
      enqueueUpdate(queue, createUpdate((n) => n + 1, SyncLane));
      enqueueUpdate(queue, createUpdate((n) => n + 1, SyncLane));
      enqueueUpdate(queue, createUpdate((n) => n + 1, SyncLane));

      const { memoizedState } = processUpdateQueue(
        0,
        queue.shared.pending,
        SyncLane
      );

      expect(memoizedState).toBe(3);
    });

    it("跳过 renderLane 不匹配的 update", () => {
      const queue = createUpdateQueue();
      enqueueUpdate(queue, createUpdate(99, 0b0010));

      const { memoizedState } = processUpdateQueue(
        5,
        queue.shared.pending,
        SyncLane
      );

      expect(memoizedState).toBe(5);
    });
  });
});
