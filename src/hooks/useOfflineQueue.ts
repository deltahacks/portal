import { useCallback, useEffect, useState } from "react";

const QUEUE_KEY = "offlineQueue";

/**
 * Custom hook to manage an offline queue in localStorage
 * Handles adding, removing, and retrieving queued items (id + task)
 */
export const useOfflineQueue = <T extends { id: string }>(key = QUEUE_KEY) => {
  const [queuedItems, setQueuedItems] = useState<T[]>([]);

  // Load queued items from localStorage on mount
  useEffect(() => {
    try {
      const existing = localStorage.getItem(key);
      const items: T[] = existing ? JSON.parse(existing) : [];
      setQueuedItems(items);
    } catch {
      setQueuedItems([]);
    }
  }, [key]);

  const addToQueue = useCallback(
    (item: T) => {
      setQueuedItems((prev) => {
        if (prev.some((existing) => existing.id === item.id)) {
          return prev;
        }
        const updated = [...prev, item];
        try {
          localStorage.setItem(key, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    },
    [key]
  );

  const removeFromQueue = useCallback(
    (id: string) => {
      setQueuedItems((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        if (updated.length === prev.length) {
          return prev;
        }
        try {
          localStorage.setItem(key, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    },
    [key]
  );

  return {
    queuedItems,
    addToQueue,
    removeFromQueue,
  };
};
