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
      if (Array.isArray(newChild)) {
        return reconcileChildrenArray(returnFiber, currentFirstChild, newChild);
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
  function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
    let lastPlacedIndex = 0;
    let firstNewFiber = null;
    let lastNewFiber = null;
    const existingChildren = new Map();
    let current = currentFirstChild;

    while (current !== null) {
      const key = current.key !== null ? current.key : current.index;
      existingChildren.set(key, current);
      current = current.sibling;
    }

    for (let i = 0; i < newChildren.length; i++) {
      const after = newChildren[i];
      const newFiber = updateFromMap(returnFiber, existingChildren, i, after);
      newFiber.return = returnFiber;
      newFiber.index = i;

      if (firstNewFiber === null) {
        lastNewFiber = firstNewFiber = newFiber;
      } else {
        lastNewFiber = lastNewFiber.sibling = newFiber;
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
    if (typeof element === "string") {
      keyToUse = index;
    } else {
      keyToUse = element.key !== null ? element.key : index;
    }
    const before = existingChildren.get(keyToUse);

    if (typeof element === "string") {
      if (before) {
        existingChildren.delete(keyToUse);
        if (before.tag === HostText) {
          return useFiber(before, { content: element });
        } else {
          deleteChild(returnFiber, before);
        }
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
    console.error("updateFromMap未处理的情况", before, element);
    return null;
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
