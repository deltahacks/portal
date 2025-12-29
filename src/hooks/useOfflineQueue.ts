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
      try {
        const existing = localStorage.getItem(key);
        const list: T[] = existing ? JSON.parse(existing) : [];
        list.push(item);
        localStorage.setItem(key, JSON.stringify(list));
        setQueuedItems(list);
      } catch {}
    },
    [key],
  );

  const removeFromQueue = useCallback(
    (id: string) => {
      try {
        const existing = localStorage.getItem(key);
        const items: T[] = existing ? JSON.parse(existing) : [];
        const filtered = items.filter((item) => item.id !== id);
        localStorage.setItem(key, JSON.stringify(filtered));
        setQueuedItems(filtered);
      } catch {}
    },
    [key],
  );

  return {
    queuedItems,
    addToQueue,
    removeFromQueue,
  };
};
