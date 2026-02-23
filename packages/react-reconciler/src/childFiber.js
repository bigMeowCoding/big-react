import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { Placement } from "./fiberFlags";
import { createFiberFromElement } from "./fiber";

function ChildReconciler(shouldTrackEffects) {
  /**
   *
   * @param {FiberNode} returnFiber 父fiber
   * @param {FiberNode|null} currentFirstChild 当前第一个子fiber
   * @param {ReactElement} newChild 新子fiber
   * @returns {FiberNode|null}
   */
  function reconcileChildFibers(returnFiber, currentFirstChild, newChild) {
    if (typeof newChild === "object" && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(
            reconcileSingleElement(returnFiber, currentFirstChild, newChild),
          );
      }
    }
  }
  /**
   *
   * @param {FiberNode} returnFiber 父fiber
   * @param {FiberNode|null} currentFirstChild 当前第一个子fiber
   * @param {ReactElement} newChild 新子fiber
   * @returns {FiberNode|null}
   */
  function reconcileSingleElement(returnFiber, currentFirstChild, newChild) {
    currentFirstChild; // TODO
    const fiber = createFiberFromElement(newChild);
    fiber.return = returnFiber;
    return fiber;
  }
  /**
   *
   * @param {FiberNode} newFiber
   * @returns {FiberNode}
   */
  function placeSingleChild(newFiber) {
    if (shouldTrackEffects) {
      newFiber.flags = Placement;
    }
    return newFiber;
  }

  return reconcileChildFibers;
}
export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
