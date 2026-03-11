import { ChildDeletion, Placement } from "./fiberFlag";
import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { createFiberFromElement } from "./fiber";
import { FiberNode } from "./fiber";
import { HostText } from "./workTags";
import { createWorkInProgress } from "./fiber";
/**
 * mount/reconcile只负责 Placement(插入)/Placement(移动)/ChildDeletion(删除)
 * 更新（文本节点内容更新、属性更新）在completeWork中，对应Update flag
 */
function ChildReconciler(shouldTrackEffects) {
  function placeSingleChild(newFiber) {
    if (shouldTrackEffects && newFiber.alternate === null) {
      newFiber.flags |= Placement;
    }
    return newFiber;
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

  function useFiber(fiber, pendingProps) {
    const clone = createWorkInProgress(fiber, pendingProps);
    clone.index = 0;
    clone.sibling = null;
    return clone;
  }
  function reconcileSingleElement(returnFiber, currentFirstChild, element) {
    // TODO 前：abc 后：a  删除bc
    // 前：a 后：b 删除b、创建a
    // 前：无 后：a 创建a
    const { key } = element;
    if (currentFirstChild !== null) {
      if (currentFirstChild.key === key) {
        if (element.$$typeof === REACT_ELEMENT_TYPE) {
          if (currentFirstChild.type === element.type) {
            const fiber = useFiber(currentFirstChild, element.props);
            fiber.return = returnFiber;
            return fiber;
          }
          deleteChild(returnFiber, currentFirstChild);
        } else {
          console.error("reconcileSingleElement未实现的类型", element);
        }
      } else {
        deleteChild(returnFiber, currentFirstChild);
      }
    }
    const fiber = createFiberFromElement(element);
    fiber.return = returnFiber;
    return fiber;
  }
  function reconcileSingleText(returnFiber, currentFirstChild, text) {
    if (currentFirstChild !== null && currentFirstChild.tag === HostText) {
      const existing = useFiber(currentFirstChild, { content: text });
      existing.return = returnFiber;
      return existing;
    }
    if (currentFirstChild !== null) {
      deleteChild(returnFiber, currentFirstChild);
    }
    const fiber = new FiberNode(HostText, { content: text }, null);
    fiber.return = returnFiber;
    return fiber;
  }
  function reconcileChildFibers(returnFiber, currentFirstChild, newChild) {
    if (newChild === null || newChild === undefined) {
      return null;
    }
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
        reconcileSingleText(returnFiber, currentFirstChild, String(newChild)),
      );
    }
    console.error("reconcileChildFibers未实现的类型", newChild);
    return null;
  }
  return reconcileChildFibers;
}

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
