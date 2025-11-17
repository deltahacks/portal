import { useCallback, useEffect, useState } from "react";

const QUEUE_KEY = "offlineQueue";

/**
 * Custom hook to manage an offline queue in localStorage
 * Handles adding, removing, and retrieving queued IDs
 */
export const useOfflineQueue = () => {
  const [queuedIds, setQueuedIds] = useState<string[]>([]);

  // Load queued IDs from localStorage on mount
  useEffect(() => {
    try {
      const existing = localStorage.getItem(QUEUE_KEY);
      const ids: string[] = existing ? JSON.parse(existing) : [];
      setQueuedIds(ids);
    } catch {
      // Handle JSON parsing errors silently
      setQueuedIds([]);
    }
  }, []);

  /**
   * Add an ID to the offline queue
   */
  const addToQueue = useCallback((id: string) => {
    try {
      const existing = localStorage.getItem(QUEUE_KEY);
      const list: string[] = existing ? JSON.parse(existing) : [];
      list.push(id);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(list));
      setQueuedIds(list);
    } catch {
      // Handle JSON parsing/stringifying errors silently
    }
  }, []);

  /**
   * Remove an ID from the offline queue
   */
  const removeFromQueue = useCallback((id: string) => {
    try {
      const existing = localStorage.getItem(QUEUE_KEY);
      const ids: string[] = existing ? JSON.parse(existing) : [];
      const filtered = ids.filter((v) => v !== id);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
      setQueuedIds(filtered);
    } catch {
      // Handle JSON parsing/stringifying errors silently
    }
  }, []);

  return {
    queuedIds,
    addToQueue,
    removeFromQueue,
  };
};
