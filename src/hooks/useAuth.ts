import { signIn } from "next-auth/react";
import { useOfflineQueue } from "./useOfflineQueue";

/**
 * Custom hook to wrap signIn functionality with offline queue clearing
 * Clears the offline queue when user logs in (for shared devices)
 */
export const useAuth = () => {
  const { clearQueue } = useOfflineQueue();

  const signInWithQueueClear = async (provider: string, options?: any) => {
    clearQueue(); // Clear offline queue on login for shared devices
    return signIn(provider, options);
  };

  return {
    signIn: signInWithQueueClear,
  };
};
