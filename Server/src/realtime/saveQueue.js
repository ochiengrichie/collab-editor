const DEFAULT_DEBOUNCE_MS = 1500;

// Latest in-memory state per document: documentId -> { content, version }
const docStateCache = new Map();

// Active save timers per document: documentId -> timeoutId
const saveTimers = new Map();

export function setDocState(documentId, state) {
  docStateCache.set(documentId, state);
}

export function getDocState(documentId) {
  return docStateCache.get(documentId);
}

export function clearDocState(documentId) {
  docStateCache.delete(documentId);
}

/*
  Debounced autosave:
  - Every update restarts the timer.
  - After user stops editing for debounceMs, we call saveFn().
 */
export function scheduleSave({documentId,content,userId,saveFn, debounceMs = DEFAULT_DEBOUNCE_MS,}) {
  if (saveTimers.has(documentId)) {
    clearTimeout(saveTimers.get(documentId));
  }

  const timeoutId = setTimeout(async () => {
    try {
      await saveFn(documentId, content, userId);
    } catch (err) {
      console.error("Autosave failed:", err);
    } finally {
      saveTimers.delete(documentId);
    }
  }, debounceMs);

  saveTimers.set(documentId, timeoutId);
}

export function cancelSave(documentId) {
  if (!saveTimers.has(documentId)) return;
  clearTimeout(saveTimers.get(documentId));
  saveTimers.delete(documentId);
}
