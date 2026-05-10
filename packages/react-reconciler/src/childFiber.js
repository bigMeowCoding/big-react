import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import { Placement, ChildDeletion as Deletion } from "./fiberFlags";
import { createFiberFromElement } from "./fiber";
import { HostText } from "./workTags";
import { FiberNode } from "./fiber";
import { createWorkInProgress } from "./fiber";

function ChildReconciler(shouldTrackEffects) {
  function placeSingleChild(newFiber) {
    if (shouldTrackEffects && newFiber.alternate === null) {
      console.log("placeSingleChild", newFiber);
      newFiber.flags = Placement;
    }
    return newFiber;
  }
  function deleteChild(returnFiber, childToDelete) {
    if (!shouldTrackEffects) {
      return;
    }
    const deletions = returnFiber.deletions;
    if (!deletions) {
      returnFiber.flags |= Deletion;
      returnFiber.deletions = [childToDelete];
    } else {
      deletions.push(childToDelete);
    }
  }

  function reconcileSingleElement(returnFiber, currentFirstChild, newChild) {
    if (currentFirstChild !== null) {
      const key = newChild.key;

      if (currentFirstChild.key === key) {
        if (newChild.$$typeof === REACT_ELEMENT_TYPE) {
          if (currentFirstChild.type === newChild.type) {
            const existing = useFiber(currentFirstChild, newChild.props);
            existing.return = returnFiber;
            return existing;
          } else {
            deleteChild(returnFiber, currentFirstChild);
          }
        } else {
          console.error("未实现的reconcile类型", newChild.$$typeof);
        }
      }
    }
    const fiber = createFiberFromElement(newChild);
    fiber.return = returnFiber;
    return fiber;
  }
  function reconcileSingleText(returnFiber, currentFirstChild, newChild) {
    if (currentFirstChild !== null) {
      if (currentFirstChild.tag === HostText) {
        const existing = useFiber(currentFirstChild, { content: newChild });
        existing.return = returnFiber;
        return existing;
      }
      deleteChild(returnFiber, currentFirstChild);
    }
    const fiber = new FiberNode(HostText, { content: newChild }, null);
    fiber.return = returnFiber;
    return fiber;
  }

  function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
    let lastPlacedIndex = 0;
    let lastNewFiber = null;
    let firstNewFiber = null;

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
      if (lastNewFiber === null) {
        lastNewFiber = newFiber;
        firstNewFiber = newFiber;
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
    let keyToUse = null;
    if (typeof element === "string") {
      keyToUse = index;
    } else {
      keyToUse = element.key === null ? index : element.key;
    }
    const before = existingChildren.get(keyToUse);
    if (typeof element === "string") {
      if (before) {
        existingChildren.delete(keyToUse);
        if (before.tag === HostText) {
          const existing = useFiber(before, { content: element });
          existing.return = returnFiber;
          return existing;
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
              const existing = useFiber(before, element.props);
              existing.return = returnFiber;
              return existing;
            } else {
              deleteChild(returnFiber, before);
            }
          }
          return createFiberFromElement(element);
        default:
          console.warn("未实现的reconcile类型", element);
          break;
      }
    }
    console.warn("未实现的reconcile类型", element);
    return null;
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
    if (typeof newChild === "string" || typeof newChild === "number") {
      return placeSingleChild(
        reconcileSingleText(returnFiber, currentFirstChild, newChild)
      );
    }
  };
}
function useFiber(current, pendingProps) {
  const clone = createWorkInProgress(current, pendingProps);
  clone.index = 0;
  clone.sibling = null;
  return clone;
}
export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
