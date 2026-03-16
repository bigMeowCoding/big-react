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
    let current = currentFirstChild;
    while (current !== null) {
      if (current.key === key) {
        if (element.$$typeof === REACT_ELEMENT_TYPE) {
          if (current.type === element.type) {
            const fiber = useFiber(currentFirstChild, element.props);
            fiber.return = returnFiber;
            deleteRemainingChildren(returnFiber, current.sibling);
            return fiber;
          } else {
            deleteRemainingChildren(returnFiber, current);
            break;
          }
        } else {
          console.error("reconcileSingleElement未实现的类型", element);
          break;
        }
      } else {
        deleteChild(returnFiber, currentFirstChild);
        current = current.sibling;
      }
    }

    const fiber = createFiberFromElement(element);
    fiber.return = returnFiber;
    return fiber;
  }
  function deleteRemainingChildren(returnFiber, current) {
    if (!shouldTrackEffects) {
      return;
    }
    let childToDelete = current;
    while (childToDelete !== null) {
      deleteChild(returnFiber, childToDelete);
      childToDelete = childToDelete.sibling;
    }
  }
  function reconcileSingleText(returnFiber, currentFirstChild, text) {
    let current = currentFirstChild;
    while (current !== null) {
      if (current.tag === HostText) {
        const existing = useFiber(current, { content: text });
        existing.return = returnFiber;
        deleteRemainingChildren(returnFiber, current.sibling);
        return existing;
      }
      deleteChild(returnFiber, current);
      current = current.sibling;
    }

    const fiber = new FiberNode(HostText, { content: text }, null);
    fiber.return = returnFiber;
    return fiber;
  }
  function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
    let lastPlacedIndex = 0;
    let firstNewFiber = null;
    let lastNewFiber = null;

    const existingChildren = new Map();
    let current = currentFirstChild;
    while (current !== null) {
      const keyToUse = current.key !== null ? current.key : current.index;
      existingChildren.set(keyToUse, current);
      current = current.sibling;
    }
    for (let i = 0; i < newChildren.length; i++) {
      const after = newChildren[i];
      const newFiber = updateFromMap(returnFiber, existingChildren, i, after);

      newFiber.return = returnFiber;
      newFiber.index = i;

      if (lastNewFiber === null) {
        firstNewFiber = newFiber;
        lastNewFiber = newFiber;
      } else {
        lastNewFiber.sibling = newFiber;
        lastNewFiber = newFiber;
      }
      if (!shouldTrackEffects) {
        continue;
      }

      const current = newFiber.alternate;
      if (current !== null) {
        const oldIndex = current.index;
        if (oldIndex < lastPlacedIndex) {
          newFiber.flags |= Placement;
          continue;
        } else {
          lastPlacedIndex = oldIndex;
        }
      } else {
        newFiber.flags |= Placement;
      }
    }
    existingChildren.forEach((child) => {
      deleteChild(returnFiber, child);
    });
    return firstNewFiber;
  }
  function updateFromMap(returnFiber, existingChildren, index, element) {
    let keyToUse;
    if (typeof element === "string" || typeof element === "number") {
      keyToUse = index;
    } else {
      keyToUse = element.key !== null ? element.key : index;
    }

    const before = existingChildren.get(keyToUse);
    if (typeof element === "string" || typeof element === "number") {
      if (before) {
        existingChildren.delete(keyToUse);
        if (before.tag === HostText) {
          return useFiber(before, { content: element });
        } else {
          deleteChild(returnFiber, before);
        }
        return useFiber(before, { content: element });
      }
      return new FiberNode(HostText, { content: element }, null);
    }
    if (typeof element === "object" && element !== null) {
      switch (element.$$typeof) {
        case REACT_ELEMENT_TYPE:
          if (before) {
            existingChildren.delete(keyToUse);
            if (before.type === element.type) {
              return useFiber(before, element.props);
            } else {
              deleteChild(returnFiber, before);
            }
          }
          return createFiberFromElement(element);
      }
    }
    console.error("updateFromMap未实现的类型", element, before);
    return null;
  }

  function reconcileChildFibers(returnFiber, currentFirstChild, newChild) {
    if (newChild === null || newChild === undefined) {
      return null;
    }
    if (typeof newChild === "object" && newChild !== null) {
      if (Array.isArray(newChild)) {
        return reconcileChildrenArray(returnFiber, currentFirstChild, newChild);
      } else {
        switch (newChild.$$typeof) {
          case REACT_ELEMENT_TYPE:
            return placeSingleChild(
              reconcileSingleElement(returnFiber, currentFirstChild, newChild),
            );
        }
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
