export function createUpdate(action, lane) {
  return {
    action,
    lane,
    next: null,
  };
}

export function initializeUpdateQueue(fiber) {
  fiber.updateQueue = {
    shared: {
      pending: null,
    },
  };
}

export function enqueueUpdate(updateQueue, update) {
  const pending = updateQueue.shared.pending;
  if (pending === null) {
    update.next = update;
  } else {
    update.next = pending.next;
    pending.next = update;
  }
  updateQueue.shared.pending = update;
}

export function createUpdateQueue() {
  return {
    shared: {
      pending: null,
    },
  };
}

export function processUpdateQueue(baseState, pendingUpdate, renderLane) {
  const result = {
    memoizedState: baseState,
  };

  if (pendingUpdate !== null) {
    const first = pendingUpdate.next;
    let pending = pendingUpdate.next;
    do {
      const updateLane = pending.lane;
      if (updateLane === renderLane) {
        const action = pending.action;
        if (typeof action === "function") {
          baseState = action(baseState);
        } else {
          baseState = action;
        }
      } else {
        console.error("不应该进入updateLane !== renderLane逻辑");
      }
      pending = pending.next;
    } while (pending !== first);
  }

  result.memoizedState = baseState;
  return result;
}
