import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { Placement } from "./fiberFlags";
import { createFiberFromElement } from "./fiber";

function ChildReconciler(shouldTrackEffects) {
  function placeSingleChild(newFiber) {
    if (shouldTrackEffects) {
      newFiber.flags = Placement;
    }
    return newFiber;
  }
  function reconcileSingleElement(returnFiber, currentFirstChild, newChild) {
    currentFirstChild;

    const fiber = createFiberFromElement(newChild);
    fiber.return = returnFiber;
    return fiber;
  }
  return function reconcileChildFibers(
    returnFiber,
    currentFirstChild,
    newChild
  ) {
    if (typeof newChild === "object" && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(
            reconcileSingleElement(returnFiber, currentFirstChild, newChild)
          );
        default:
          console.warn("未实现的reconcile类型", newChild);
          break;
      }
    }
  };
}

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
