import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { Placement } from "./fiberFlags";
import { ChildDeletion } from "./fiberFlags";
import { createFiberFromElement } from "./fiber";
import { HostText } from "./workTags";
import { FiberNode } from "./fiber";
import { createWorkInProgress } from "./fiber";

/**
 * mount/reconcile只负责 Placement(插入)/Placement(移动)/ChildDeletion(删除)
 * 更新（文本节点内容更新、属性更新）在completeWork中，对应Update flag
 */
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
    if (typeof newChild === "string" || typeof newChild === "number") {
      return placeSingleChild(
        reconcileSingleText(returnFiber, currentFirstChild, newChild + ""),
      );
    }
    console.error("未实现的reconcile类型");
    return null;
  }
  /**
   *
   * @param {FiberNode} returnFiber 父fiber
   * @param {FiberNode|null} currentFirstChild 当前第一个子fiber
   * @param {ReactElement} newChild 新子fiber
   * @returns {FiberNode|null}
   */
  function reconcileSingleElement(returnFiber, currentFirstChild, newChild) {
    const key = newChild.key;
    if (currentFirstChild !== null) {
      if (currentFirstChild.key === key) {
        if (newChild.$$typeof === REACT_ELEMENT_TYPE) {
          if (currentFirstChild.type === newChild.type) {
            const existing = useFiber(currentFirstChild, newChild.props);
            existing.return = returnFiber;
            return existing;
          }
          deleteChild(returnFiber, currentFirstChild);
        } else {
          console.error("未实现的reconcile类型");
        }
      } else {
        deleteChild(returnFiber, currentFirstChild);
      }
    }
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

  function reconcileSingleText(returnFiber, currentFirstChild, newChild) {
    if (currentFirstChild !== null && currentFirstChild.tag === HostText) {
      const existing = useFiber(currentFirstChild, { content: newChild });
      existing.return = returnFiber;
      return existing;
    }
    if (currentFirstChild !== null) {
      deleteChild(returnFiber, currentFirstChild);
    }
    const fiber = new FiberNode(
      HostText,
      {
        content: newChild,
      },
      null,
    );
    fiber.return = returnFiber;
    return fiber;
  }
  function deleteChild(returnFiber, childToDelete) {
    if (!shouldTrackEffects) {
      return;
    }
    const deletions = returnFiber.deletions;
    if (deletions === null) {
      returnFiber.deletions = [childToDelete];
      returnFiber.flags |= ChildDeletion;
    } else {
      deletions.push(childToDelete);
    }
  }
  return reconcileChildFibers;
}
/**
 * @description 复用fiber
 * @param {FiberNode} current
 * @param {any} pendingProps
 * @returns {FiberNode}
 */
function useFiber(current, pendingProps) {
  const clone = createWorkInProgress(current, pendingProps);
  clone.sibling = null;
  clone.index = 0;
  return clone;
}

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
