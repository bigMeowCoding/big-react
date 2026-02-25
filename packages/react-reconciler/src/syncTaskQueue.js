let syncQueue = [];
let isFlushingSyncQueue = false;

export function scheduleSyncCallback(callback) {
  if (!syncQueue) {
    syncQueue = [callback];
  } else {
    syncQueue.push(callback);
  }
}

export function flushSyncCallbacks() {
  if (!isFlushingSyncQueue && syncQueue) {
    isFlushingSyncQueue = true;
    try {
      syncQueue.forEach((callback) => callback());
      syncQueue = null;
    } catch (error) {
      console.error(error);
    } finally {
      isFlushingSyncQueue = false;
    }
  }
}
