import { REACT_ELEMENT_TYPE, REACT_FRAGMENT_TYPE } from "shared/ReactSymbols";
import { Placement, ChildDeletion as Deletion } from "./fiberFlags";
import { createFiberFromElement, createFiberFromFragment } from "./fiber";
import { Fragment, HostText } from "./workTags";
import { FiberNode } from "./fiber";
import { createWorkInProgress } from "./fiber";

function getElementKeyToUse(element, index) {
  if (
    Array.isArray(element) ||
    typeof element === "string" ||
    typeof element === "number"
  ) {
    return index;
  }
  return element.key !== null ? element.key : index;
}

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
  function deleteRemainingChildren(returnFiber, currentFirstChild) {
    while (currentFirstChild !== null) {
      deleteChild(returnFiber, currentFirstChild);
      currentFirstChild = currentFirstChild.sibling;
    }
  }

  function reconcileSingleElement(returnFiber, currentFirstChild, element) {
    const key = element.key;
    let currentFiber = currentFirstChild;
    while (currentFiber !== null) {
      if (currentFiber.key === key) {
        if (element.$$typeof === REACT_ELEMENT_TYPE) {
          if (currentFiber.type === element.type) {
            let props = element.props;
            if (element.type === REACT_FRAGMENT_TYPE) {
              props = element.props.children;
            }
            const existing = useFiber(currentFiber, props);
            existing.return = returnFiber;
            deleteRemainingChildren(returnFiber, currentFiber.sibling);
            return existing;
          }
          deleteChild(returnFiber, currentFiber);
        } else {
          console.error("未实现的reconcile类型", element.$$typeof);
        }
      } else {
        deleteChild(returnFiber, currentFiber);
      }
      currentFiber = currentFiber.sibling;
    }
    let fiber;
    if (element.type === REACT_FRAGMENT_TYPE) {
      fiber = createFiberFromFragment(element.props.children, key);
    } else {
      fiber = createFiberFromElement(element);
    }
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
      if (newFiber === null) {
        continue;
      }
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
      const alternate = newFiber.alternate;
      if (alternate !== null) {
        const oldIndex = alternate.index;
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
    const keyToUse = getElementKeyToUse(element, index);
    const before = existingChildren.get(keyToUse);
    if (typeof element === "string" || typeof element === "number") {
      const text = "" + element;
      if (before) {
        existingChildren.delete(keyToUse);
        if (before.tag === HostText) {
          const existing = useFiber(before, { content: text });
          existing.return = returnFiber;
          return existing;
        } else {
          deleteChild(returnFiber, before);
        }
      }
      return new FiberNode(HostText, { content: text }, null);
    }
    if (typeof element === "object" && element !== null) {
      switch (element.$$typeof) {
        case REACT_ELEMENT_TYPE:
          if (element.type === REACT_FRAGMENT_TYPE) {
            return updateFragment(
              returnFiber,
              before,
              element.props.children,
              keyToUse,
              existingChildren
            );
          }
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

    if (Array.isArray(element)) {
      return updateFragment(
        returnFiber,
        before,
        element,
        keyToUse,
        existingChildren
      );
    }
    console.warn("未实现的reconcile类型", element);
    return null;
  }

  function updateFragment(
    returnFiber,
    current,
    elements,
    key,
    existingChildren
  ) {
    let fiber;
    if (!current || current.tag !== Fragment) {
      fiber = createFiberFromFragment(elements, key);
    } else {
      existingChildren.delete(key);
      fiber = useFiber(current, elements);
    }
    fiber.return = returnFiber;
    return fiber;
  }

  return function reconcileChildFibers(
    returnFiber,
    currentFirstChild,
    newChild
  ) {
    const isUnkeyedTopLevelFragment =
      typeof newChild === "object" &&
      newChild !== null &&
      newChild.type === REACT_FRAGMENT_TYPE &&
      newChild.key === null;
    if (isUnkeyedTopLevelFragment) {
      newChild = newChild.props.children;
    }

    if (typeof newChild === "object" && newChild !== null) {
      if (Array.isArray(newChild)) {
        return reconcileChildrenArray(returnFiber, currentFirstChild, newChild);
      }
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

    if (currentFirstChild !== null) {
      deleteRemainingChildren(returnFiber, currentFirstChild);
    }

    if (newChild === null || newChild === undefined) {
      return null;
    }

    console.warn("未实现的reconcile类型", newChild);
    return null;
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
