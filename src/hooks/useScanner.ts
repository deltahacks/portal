import { useCallback, useEffect, useRef, useState } from "react";
import { trpc } from "../utils/trpc";
import { useOfflineQueue, QueueItem } from "./useOfflineQueue";
import { z } from "zod";

type Station = "checkIn" | "food" | "events";

type ScanState = {
  status: "idle" | "success" | "error";
  message?: string;
};

/**
 * Custom hook to manage scanner state and offline queue persistence
 * Handles scanning logic, mutations, and localStorage management
 */
export const useScanner = () => {
  const [scannedValue, setScannedValue] = useState<string | null>(null);
  const [scanState, setScanState] = useState<ScanState>({ status: "idle" });
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const { queuedItems, addToQueue, removeFromQueue, clearQueue } =
    useOfflineQueue();
  const hasProcessedInitialQueue = useRef(false);

  const scannerMutation = trpc.scanner.scan.useMutation({
    onSuccess: (data) => {
      setScanState({ status: "idle" });
      // remove successfully mutated ids from offline queue
      if (data?.id) {
        removeFromQueue(data.id);
      }
    },
    onError: (error) => {
      console.error(error);
      setScanState({
        status: "error",
        message: error.message || "Failed to check in user. Please try again.",
      });
    },
  });

  // On page load, remutate any queued items
  useEffect(() => {
    if (!hasProcessedInitialQueue.current && queuedItems.length > 0) {
      hasProcessedInitialQueue.current = true;
      queuedItems.forEach((item) => {
        scannerMutation.mutate({ id: item.id, task: item.task });
      });
    }
  }, [queuedItems]);

  // Handle new scanned values
  useEffect(() => {
    if (scannedValue) {
      const isValidCuid = z.cuid().safeParse(scannedValue).success;

      if (!isValidCuid) {
        setScanState({
          status: "error",
          message: "Invalid QR code format. Please scan a valid attendee pass.",
        });
        return;
      }

      if (!selectedStation) {
        setScanState({
          status: "error",
          message: "Please select a station first.",
        });
        return;
      }

      setScanState({ status: "success" });
      scannerMutation.mutate({
        id: scannedValue,
        task: selectedStation,
      });

      // add scanned item to offline queue for persistence
      addToQueue({ id: scannedValue, task: selectedStation });
    }
  }, [scannedValue, selectedStation]);

  const handleScan = useCallback((value: string | null) => {
    setScannedValue(value);
  }, []);

  const handleStationSelect = useCallback((station: Station | null) => {
    setSelectedStation(station);
    setScannedValue(null);
    setScanState({ status: "idle" });
  }, []);

  const clearScannerState = useCallback(() => {
    setSelectedStation(null);
    setScannedValue(null);
    setScanState({ status: "idle" });
  }, []);

  return {
    scannedValue,
    scanState,
    setScanState,
    selectedStation,
    queuedItems,
    handleScan,
    handleStationSelect,
    clearScannerState,
    clearQueue,
  };
};
