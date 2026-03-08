import { FiberNode, FiberRootNode } from "./fiber";
import { HostRoot } from "./workTags";
import {
  initializeUpdateQueue,
  createUpdate,
  enqueueUpdate,
} from "./updateQueue";
import { scheduleUpdateOnFiber } from "./workLoop";

export function createContainer(container) {
  const hostRootFiber = new FiberNode(HostRoot, {}, null);
  const root = new FiberRootNode(container, hostRootFiber);
  initializeUpdateQueue(hostRootFiber);
  return root;
}

export function updateContainer(element, root) {
  const hostRootFiber = root.current;
  const update = createUpdate(element);
  enqueueUpdate(hostRootFiber, update);
  scheduleUpdateOnFiber(hostRootFiber);
}
