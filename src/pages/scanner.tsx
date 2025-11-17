import type {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextPage,
} from "next";
import Head from "next/head";
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import Drawer from "../components/Drawer";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { rbac } from "../components/RBACWrapper";
import { Role } from "@prisma/client";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { trpc } from "../utils/trpc";
import { useOfflineQueue } from "../hooks/useOfflineQueue";

const highlightCodeOnCanvas = (
  detectedCodes: IDetectedBarcode[],
  ctx: CanvasRenderingContext2D,
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
      boundingBox.height + padding * 2,
    );
  });
  ctx.restore();
};

const ScannerPage: NextPage = () => {
  const [scannedValue, setScannedValue] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const { queuedIds, addToQueue, removeFromQueue, getQueuedIds } =
    useOfflineQueue();

  const scannerMutation = trpc.scanner.scan.useMutation({
    onSettled: (data) => {
      setScanStatus("idle");
      // remove succesfully mutated ids from offline queue
      if (data?.id) {
        removeFromQueue(data.id);
      }
    },
    onError: (error) => {
      console.error(error);
      setScanStatus("error");
    },
  });
  useEffect(() => {
    // On page load, remutate any queued IDs
    const ids = getQueuedIds();
    if (ids.length > 0) {
      ids.forEach((queuedId) => {
        scannerMutation.mutate({ id: queuedId, task: "checkIn" });
      });
    }
  }, []);

  useEffect(() => {
    if (scannedValue) {
      scannerMutation.mutate({
        id: scannedValue,
        task: "checkIn",
      });

      // add scanned id to offline queue for persistence
      addToQueue(scannedValue);
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

            <div className="rounded-md p-6 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 bg-white border">
              <div className="flex flex-col items-center justify-center">
                <div
                  className={clsx(
                    "relative w-full max-w-[320px] border-4 border-dashed rounded-md p-1",
                    scanStatus === "success"
                      ? "border-green-500"
                      : scanStatus === "error"
                        ? "border-red-500"
                        : "border-primary",
                  )}
                >
                  <Scanner
                    onScan={(result) => {
                      setScannedValue(result[0]?.rawValue ?? null);
                      setScanStatus("success");
                    }}
                    onError={(error) => {
                      console.error(error);
                      setScanStatus("error");
                    }}
                    sound={false}
                    constraints={{
                      facingMode: "environment",
                      aspectRatio: 1,
                      width: { ideal: 1920 },
                      height: { ideal: 1080 },
                    }}
                    components={{
                      tracker: highlightCodeOnCanvas,
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
                {scannedValue ? (
                  <p className="mt-4 text-neutral-500 dark:text-neutral-400 text-center overflow-auto">
                    Scanned Value: {scannedValue}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </main>
      </Drawer>
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  let output: GetServerSidePropsResult<Record<string, unknown>> = { props: {} };
  output = rbac(
    await getServerAuthSession(context),
    [Role.ADMIN],
    undefined,
    output,
  );
  return output;
};

export default ScannerPage;
