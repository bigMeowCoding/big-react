export const createUpdate = (payload, lane) => {
  return { action: payload, lane, next: null };
};
/**
 * 将新的 update 插入到 updateQueue 队列中。
 * 这里采用的是环形链表的结构，保证多次更新都能被处理。
 *
 * @param {Object} updateQueue - 包含 shared.pending 的 update 队列对象
 * @param {Object} update - 新的 update 节点
 */
export const enqueueUpdate = (updateQueue, update) => {
  console.log("将update插入队列", update);
  const pending = updateQueue.shared.pending;
  if (pending === null) {
    // 当前队列为空，创建一个指向自身的环
    update.next = update;
  } else {
    // 队列已有更新，将新 update 插入到环形链表的队尾
    update.next = pending.next; // 指向队头
    pending.next = update; // 链接到队尾
  }
  // 更新 shared.pending 指向最新的 update（最新的队尾）
  updateQueue.shared.pending = update;
};
export const createUpdateQueue = () => {
  const updateQueue = {
    shared: {
      pending: null,
    },
    dispatch: null,
  };
  return updateQueue;
};
export const processUpdateQueue = (
  baseState,
  updateQueue,
  fiber,
  renderLane,
) => {
  if (updateQueue !== null) {
    const pending = updateQueue.shared.pending;
    const pendingUpdate = pending;
    updateQueue.shared.pending = null;

    if (pendingUpdate !== null) {
      let update = pendingUpdate;
      do {
        const updateLane = update.lane;
        if (renderLane === updateLane) {
          const action = update.action;
          if (action instanceof Function) {
            baseState = action(baseState);
          } else {
            baseState = action;
          }
        } else {
          console.error(
            "update的lane与renderLane不一致",
            updateLane,
            renderLane,
          );
        }
        update = update.next;
      } while (update !== pendingUpdate);
    }
  } else {
    console.error(fiber, "updateQueue is null");
  }
  return baseState;
};
