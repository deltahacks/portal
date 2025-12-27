import { useEffect, useState } from "react";

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

  /**
   * Add an item to the offline queue
   */
  const addToQueue = (item: T) => {
    try {
      const existing = localStorage.getItem(key);
      const list: T[] = existing ? JSON.parse(existing) : [];
      list.push(item);
      localStorage.setItem(key, JSON.stringify(list));
      setQueuedItems(list);
    } catch {}
  };

  /**
   * Remove an item from the offline queue by ID
   */
  const removeFromQueue = (id: string) => {
    try {
      const existing = localStorage.getItem(key);
      const items: T[] = existing ? JSON.parse(existing) : [];
      const filtered = items.filter((item) => item.id !== id);
      localStorage.setItem(key, JSON.stringify(filtered));
      setQueuedItems(filtered);
    } catch {}
  };

  return {
    queuedItems,
    addToQueue,
    removeFromQueue,
  };
};
