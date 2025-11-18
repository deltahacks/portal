import type {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextPage,
} from "next";
import Head from "next/head";
import { Scanner } from "@yudiel/react-qr-scanner";
import Drawer from "../components/Drawer";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { Role } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { trpc } from "../utils/trpc";
import { useOfflineQueue } from "../hooks/useOfflineQueue";
import { z } from "zod";
import { IDetectedBarcode } from "@yudiel/react-qr-scanner";

// This causes massive fps drop.
const highlightCodeOnCanvas = (
  detectedCodes: IDetectedBarcode[],
  ctx: CanvasRenderingContext2D
) => {
  const canvas = ctx.canvas;

  // darken the canvas
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Cut out around detected codes to create a spotlight effect
  ctx.globalCompositeOperation = "destination-out";
  const padding = 8;
  detectedCodes.forEach(({ boundingBox }) => {
    ctx.fillRect(
      Math.max(0, boundingBox.x - padding),
      Math.max(0, boundingBox.y - padding),
      boundingBox.width + padding * 2,
      boundingBox.height + padding * 2
    );
  });
  ctx.restore();
};

type Station = "checkIn" | "food" | "events";

type ScannerPageProps = {
  userRoles: string[];
};

const ScannerPage: NextPage<ScannerPageProps> = ({ userRoles }) => {
  const [scannedValue, setScannedValue] = useState<string | null>(null);
  const [scanState, setScanState] = useState<{
    status: "idle" | "success" | "error";
    message?: string;
  }>({ status: "idle" });
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const { queuedItems, addToQueue, removeFromQueue } = useOfflineQueue();
  const hasProcessedInitialQueue = useRef(false);

  const availableStations = {
    checkIn:
      userRoles.includes(Role.ADMIN) ||
      userRoles.includes(Role.GENERAL_SCANNER),
    food:
      userRoles.includes(Role.ADMIN) || userRoles.includes(Role.FOOD_MANAGER),
    events:
      userRoles.includes(Role.ADMIN) || userRoles.includes(Role.EVENT_MANAGER),
  };

  // canner persistence works by adding any scanned qr code to the offline queue and removing them
  // only when the mutaiton is succesful. This is because tanstack already retries failed mutation until success.
  // Saving in the local storage is only for persistence across page reloads.
  const scannerMutation = trpc.scanner.scan.useMutation({
    onSuccess: (data) => {
      setScanState({ status: "idle" });
      // remove succesfully mutated ids from offline queue
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
  useEffect(() => {
    // On page load, remutate any queued items
    if (!hasProcessedInitialQueue.current && queuedItems.length > 0) {
      hasProcessedInitialQueue.current = true;
      queuedItems.forEach((item) => {
        scannerMutation.mutate({ id: item.id, task: item.task });
      });
    }
  }, [queuedItems]);

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
  }, [scannedValue]);

  return (
    <>
      <Head>
        <title>QR Scanner - Deltahacks 12</title>
      </Head>

      <Drawer
        pageTabs={[
          { pageName: "Dashboard", link: "/dashboard" },
          { pageName: "Scanner", link: "/scanner" },
        ]}
      >
        <main className="px-7 py-16 sm:px-14 lg:pl-20 2xl:pt-20">
          <div className="max-w-4xl">
            <h1 className="text-2xl font-bold mb-8 text-black dark:text-white">
              QR Code Scanner
            </h1>

            {!selectedStation ? (
              <div className="rounded-md p-8 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 bg-white border">
                <h2 className="text-xl font-semibold mb-4 text-black dark:text-white text-center">
                  Select Station
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center mb-6">
                  Choose which station you are scanning for.
                </p>
                <div className="flex flex-col gap-3 max-w-md mx-auto">
                  {availableStations.checkIn && (
                    <button
                      onClick={() => setSelectedStation("checkIn")}
                      className="px-6 py-4 rounded-lg font-medium transition-colors bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600"
                    >
                      Check In
                    </button>
                  )}
                  {availableStations.food && (
                    <button
                      onClick={() => setSelectedStation("food")}
                      className="px-6 py-4 rounded-lg font-medium transition-colors bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600"
                    >
                      Food
                    </button>
                  )}
                  {availableStations.events && (
                    <button
                      onClick={() => setSelectedStation("events")}
                      className="px-6 py-4 rounded-lg font-medium transition-colors bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600"
                    >
                      Events
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-black dark:text-white">
                      Station:
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary text-white">
                      {selectedStation === "checkIn"
                        ? "Check In"
                        : selectedStation === "food"
                          ? "Food"
                          : "Events"}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedStation(null);
                      setScannedValue(null);
                      setScanState({ status: "idle" });
                    }}
                    className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
                  >
                    Change Station
                  </button>
                </div>

                <div className="rounded-md p-6 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 bg-white border">
                  <div className="flex flex-col items-center justify-center">
                    <div
                      className={clsx(
                        "relative w-full max-w-[320px] border-4 border-dashed rounded-md p-1",
                        scanState.status === "success"
                          ? "border-green-500"
                          : scanState.status === "error"
                            ? "border-red-500"
                            : "border-primary"
                      )}
                    >
                      <Scanner
                        onScan={(result) => {
                          setScannedValue(result[0]?.rawValue ?? null);
                        }}
                        onError={(error) => {
                          console.error(error);
                          setScanState({
                            status: "error",
                            message: "Camera error. Please try again.",
                          });
                        }}
                        sound={false}
                        constraints={{
                          facingMode: "environment",
                          aspectRatio: 1,
                          width: { ideal: 1920 },
                          height: { ideal: 1080 },
                        }}
                        components={{
                          // tracker: highlightCodeOnCanvas,
                          finder: false,
                        }}
                        classNames={{
                          container: "w-full h-full",
                          video: "w-full h-full object-cover rounded",
                        }}
                      />
                    </div>
                    <p className="mt-4 text-neutral-500 dark:text-neutral-400 text-center">
                      Position the QR code within the frame to scan
                    </p>

                    {scanState.status === "success" && (
                      <p className="mt-4 text-green-600 dark:text-green-400 text-center font-medium">
                        ✓ Check-in successful!
                      </p>
                    )}

                    {scanState.status === "error" && scanState.message && (
                      <p className="mt-4 text-red-600 dark:text-red-400 text-center font-medium">
                        {scanState.message}
                      </p>
                    )}

                    {scannedValue && scanState.status !== "error" ? (
                      <p className="mt-2 text-neutral-500 dark:text-neutral-400 text-center text-sm overflow-auto">
                        Scanned: {scannedValue}
                      </p>
                    ) : null}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </Drawer>
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<ScannerPageProps>> => {
  const session = await getServerAuthSession(context);

  if (!session || !session.user) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  const userRoles = session.user.role || [];
  const requiredRoles = [
    Role.ADMIN,
    Role.GENERAL_SCANNER,
    Role.FOOD_MANAGER,
    Role.EVENT_MANAGER,
  ];
  const authorized = requiredRoles.some((role) => userRoles.includes(role));

  if (!authorized) {
    return { redirect: { destination: "/dashboard", permanent: false } };
  }

  return {
    props: {
      userRoles,
    },
  };
};

export default ScannerPage;
