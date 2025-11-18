import { useCallback, useEffect, useState } from "react";

const QUEUE_KEY = "offlineQueue";

export type QueueItem = {
  id: string;
  task: "checkIn" | "food" | "events";
};

/**
 * Custom hook to manage an offline queue in localStorage
 * Handles adding, removing, and retrieving queued items (id + task)
 */
export const useOfflineQueue = () => {
  const [queuedItems, setQueuedItems] = useState<QueueItem[]>([]);

  // Load queued items from localStorage on mount
  useEffect(() => {
    try {
      const existing = localStorage.getItem(QUEUE_KEY);
      const items: QueueItem[] = existing ? JSON.parse(existing) : [];
      setQueuedItems(items);
    } catch {
      // Handle JSON parsing errors silently
      setQueuedItems([]);
    }
  }, []);

  /**
   * Add an item to the offline queue
   */
  const addToQueue = useCallback((item: QueueItem) => {
    try {
      const existing = localStorage.getItem(QUEUE_KEY);
      const list: QueueItem[] = existing ? JSON.parse(existing) : [];
      list.push(item);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(list));
      setQueuedItems(list);
    } catch {
      // Handle JSON parsing/stringifying errors silently
    }
  }, []);

  /**
   * Remove an item from the offline queue by ID
   */
  const removeFromQueue = useCallback((id: string) => {
    try {
      const existing = localStorage.getItem(QUEUE_KEY);
      const items: QueueItem[] = existing ? JSON.parse(existing) : [];
      const filtered = items.filter((item) => item.id !== id);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
      setQueuedItems(filtered);
    } catch {
      // Handle JSON parsing/stringifying errors silently
    }
  }, []);

  return {
    queuedItems,
    addToQueue,
    removeFromQueue,
  };
};
