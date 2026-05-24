import { describe, expect, it, vi } from "vitest";
import {
  flushSyncCallbacks,
  scheduleSyncCallback,
} from "../syncTaskQueue.js";

describe("syncTaskQueue", () => {
  it("scheduleSyncCallback 批量执行回调", () => {
    const first = vi.fn();
    const second = vi.fn();

    scheduleSyncCallback(first);
    scheduleSyncCallback(second);
    flushSyncCallbacks();

    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
  });

  it("flushSyncCallbacks 执行后清空队列", () => {
    const callback = vi.fn();
    scheduleSyncCallback(callback);

    flushSyncCallbacks();
    flushSyncCallbacks();

    expect(callback).toHaveBeenCalledOnce();
  });

  it("flushSyncCallbacks 防重入", () => {
    let nested = false;
    scheduleSyncCallback(() => {
      nested = true;
      flushSyncCallbacks();
    });

    flushSyncCallbacks();
    expect(nested).toBe(true);
  });
});
