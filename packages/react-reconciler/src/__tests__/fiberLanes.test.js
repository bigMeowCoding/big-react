import { describe, expect, it } from "vitest";
import { SyncLane, NoLane, NoLanes } from "../fiberLanes.js";
import {
  mergeLanes,
  getHighestPriorityLane,
  markRootFinished,
  requestUpdateLane,
} from "../fiberLanes.js";
import { FiberRootNode } from "../fiber.js";
import { FiberNode } from "../fiber.js";
import { HostRoot } from "../workTags.js";

describe("fiberLanes", () => {
  it("requestUpdateLane 返回 SyncLane", () => {
    expect(requestUpdateLane()).toBe(SyncLane);
  });

  it("mergeLanes 按位或合并", () => {
    expect(mergeLanes(SyncLane, SyncLane)).toBe(SyncLane);
    expect(mergeLanes(NoLanes, SyncLane)).toBe(SyncLane);
  });

  it("getHighestPriorityLane 取最高优先级 lane", () => {
    expect(getHighestPriorityLane(SyncLane)).toBe(SyncLane);
    expect(getHighestPriorityLane(NoLanes)).toBe(NoLane);
  });

  it("markRootFinished 清除对应 pendingLanes", () => {
    const hostRoot = new FiberNode(HostRoot, {}, null);
    const root = new FiberRootNode({}, hostRoot);
    root.pendingLanes = SyncLane;

    markRootFinished(root, SyncLane);

    expect(root.pendingLanes).toBe(NoLanes);
  });
});
