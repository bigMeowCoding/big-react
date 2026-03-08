import { Placement } from "./fiberFlag";
import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { createFiberFromElement } from "./fiber";
import { FiberNode } from "./fiber";
import { HostText } from "./workTags";

function ChildReconciler(shouldTrackEffects) {
  function placeSingleChild(newFiber) {
    if (shouldTrackEffects) {
      newFiber.flags |= Placement;
    }
    return newFiber;
  }
  function reconcileSingleElement(returnFiber, currentFirstChild, element) {
    currentFirstChild;
    const fiber = createFiberFromElement(element);
    fiber.return = returnFiber;
    return fiber;
  }
  function reconcileSingleText(returnFiber, currentFirstChild, text) {
    currentFirstChild;
    const fiber = new FiberNode(HostText, { content: text }, null);
    fiber.return = returnFiber;
    return fiber;
  }
  function reconcileChildFibers(returnFiber, currentFirstChild, newChild) {
    if (typeof newChild === "object" && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(
            reconcileSingleElement(returnFiber, currentFirstChild, newChild),
          );
      }
    }
    if (typeof newChild === "string") {
      return placeSingleChild(
        reconcileSingleText(returnFiber, currentFirstChild, newChild),
      );
    }
    console.error("reconcileChildFibers未实现的类型", newChild);
    return null;
  }
  return reconcileChildFibers;
}

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
