let syncQueue = null;
let isFlushingSyncQueue = false;

export function scheduleSyncCallback(callback) {
  if (syncQueue === null) {
    syncQueue = [callback];
  } else {
    syncQueue.push(callback);
  }
}

export function flushSyncCallbacks() {
  if (!isFlushingSyncQueue && syncQueue) {
    isFlushingSyncQueue = true;
    const queue = syncQueue;
    syncQueue = null;
    try {
      queue.forEach((callback) => callback());
    } catch (error) {
      console.error("flushSyncCallbacks报错", error);
    } finally {
      isFlushingSyncQueue = false;
    }
  }
}
