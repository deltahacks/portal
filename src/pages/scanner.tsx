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
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import clsx from "clsx";
import { trpc } from "../utils/trpc";
import { useOfflineQueue } from "../hooks/useOfflineQueue";
import { z } from "zod";
import { Input } from "../components/Input";
import {
  type Station,
  type WizardState,
  type WizardAction,
  type ScannerQueueItem,
  type ScanState,
  stationOptionsMap,
  initialWizardState,
  stationLabels,
} from "../schemas/scanner";

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SELECT_STATION": {
      const options = stationOptionsMap[action.station];
      const hasOptions = options.length > 0;
      return {
        step: hasOptions ? "selectingOption" : "ready",
        station: {
          name: action.station,
          type: hasOptions ? "" : action.station,
        },
      };
    }
    case "SELECT_OPTION":
      if (!state.station) return state;
      return {
        ...state,
        step: "ready",
        station: { name: state.station.name, type: action.option },
      };
    case "RESET":
      return initialWizardState;
    default:
      return state;
  }
}

const StationSelection: React.FC<{
  stations: { checkIn: boolean; food: boolean; events: boolean };
  changeStation: (station: Station) => void;
}> = ({ stations, changeStation }) => {
  return (
    <div className="rounded-md p-8 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 bg-white border">
      <h2 className="text-xl font-semibold mb-4 text-black dark:text-white text-center">
        Select Station
      </h2>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center mb-6">
        Choose which station you are scanning for.
      </p>
      <div className="flex flex-col gap-3 max-w-md mx-auto">
        {stations.checkIn && (
          <button
            onClick={() => changeStation("checkIn")}
            className="px-6 py-4 rounded-lg font-medium transition-colors bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600"
          >
            Check In
          </button>
        )}
        {stations.food && (
          <button
            onClick={() => changeStation("food")}
            className="px-6 py-4 rounded-lg font-medium transition-colors bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600"
          >
            Food
          </button>
        )}
        {stations.events && (
          <button
            onClick={() => changeStation("events")}
            className="px-6 py-4 rounded-lg font-medium transition-colors bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600"
          >
            Events
          </button>
        )}
      </div>
    </div>
  );
};

const StationConfigSelection: React.FC<{
  station: Station;
  options: readonly string[];
  changeStationOption: (option: string) => void;
  onBack: () => void;
}> = ({ station, options, changeStationOption, onBack }) => {
  const [search, setSearch] = useState("");
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="rounded-md p-8 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 bg-white border flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          ← Back
        </button>
      </div>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
        {station === "food" && "Which meal are you serving?"}
        {station === "events" && "Which event are you scanning for?"}
      </p>
      <Input
        placeholder="Search for an option"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="flex flex-col gap-3 ">
        {filteredOptions.map((option) => (
          <button
            key={option}
            className="px-6 py-4 rounded-lg font-medium transition-colors bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600"
            onClick={() => changeStationOption(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

const ScannerUI: React.FC<{
  station: { name: Station; type: string };
  onReset: () => void;
}> = ({ station, onReset }) => {
  const lastScannedRef = useRef<string | null>(null);
  const hasProcessedInitialQueue = useRef(false);
  const [scannedValue, setScannedValue] = useState<string | null>(null);
  const [scanState, setScanState] = useState<ScanState>({ status: "idle" });

  const { queuedItems, addToQueue, removeFromQueue } =
    useOfflineQueue<ScannerQueueItem>();

  // scanner persistence works by adding any scanned qr code to the offline queue and removing them
  // only when the mutaiton is succesful. This is because tanstack already retries failed mutation until success.
  // Saving in the local storage is only for persistence across page reloads.
  const scannerMutation = trpc.scanner.scan.useMutation({
    onSuccess: (data) => {
      // remove succesfully mutated ids from offline queue
      if (data?.id) {
        removeFromQueue(data.id);
      }
    },
    onError: (error) => {
      let message: string | undefined;
      if (station.name === "checkIn") {
        message = "Failed to check in attendee. Please try again.";
      } else if (station.name === "food") {
        message = "Failed to claim food ticket. Please try again.";
      } else if (station.name === "events") {
        message = "Failed to register for event. Please try again.";
      }
      setScanState({
        status: "error",
        message,
        error:
          error instanceof Error
            ? (error.stack ?? error.message)
            : JSON.stringify(error, null, 2),
      });
    },
  });

  // Need acccess to stable mutation function
  // @see https://github.com/TanStack/query/issues/1858
  const { mutate: mutateScannedId } = scannerMutation;

  useEffect(() => {
    // On mount, re-mutate any queued items from previous sessions
    if (!hasProcessedInitialQueue.current && queuedItems.length > 0) {
      hasProcessedInitialQueue.current = true;
      queuedItems.forEach((item) => {
        mutateScannedId({ id: item.id, station: item.station });
      });
    }
  }, [queuedItems, mutateScannedId]);

  useEffect(() => {
    if (scanState.status === "success") {
      const timer = setTimeout(() => {
        setScanState({ status: "idle" });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [scanState.status]);

  const handleScan = useCallback(
    (result: { rawValue: string }[]) => {
      const value = result[0]?.rawValue;
      // need to deduplicate scans since scanner keeps firing and would cause infinite re-scans
      if (!value || value === lastScannedRef.current) return;

      lastScannedRef.current = value;
      setScannedValue(value);

      const isValidCuid = z.cuid().safeParse(value).success;
      if (!isValidCuid) {
        setScanState({
          status: "error",
          message: "Invalid QR code format. Please scan a valid attendee pass.",
          error: "Zod validation error. This is not a valid CUID.",
        });
        return;
      }

      setScanState({ status: "success" });
      addToQueue({ id: value, station });
      mutateScannedId({ id: value, station });
    },
    [station, addToQueue, mutateScannedId],
  );

  const handleError = useCallback((error: unknown) => {
    console.error(error);
    setScanState({
      status: "error",
      message: "Camera error. Please try again.",
      error:
        error instanceof Error ? (error.stack ?? error.message) : String(error),
    });
  }, []);

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-black dark:text-white">
            Station:
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary text-white">
            {stationLabels[station.name]}
          </span>
        </div>
        <button
          onClick={onReset}
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
                  : "border-primary",
            )}
          >
            <Scanner
              onScan={handleScan}
              onError={handleError}
              sound={false}
              constraints={{
                facingMode: "environment",
                aspectRatio: 1,
                width: { ideal: 1920 },
                height: { ideal: 1080 },
              }}
              components={{
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
              ✓ Scan successful!
            </p>
          )}

          {scanState.status === "error" && scanState.message && (
            <p className="mt-4 text-red-600 dark:text-red-400 text-center font-medium">
              {scanState.message}
            </p>
          )}

          {scannedValue && scanState.status !== "error" && (
            <p className="mt-2 text-neutral-500 dark:text-neutral-400 text-center text-sm overflow-auto">
              Scanned: {scannedValue}
            </p>
          )}
          {scanState.status === "error" && scanState.error && (
            <details className="mt-4 w-full">
              <summary className="text-red-600 dark:text-red-400 text-center font-medium cursor-pointer text-xs">
                Error details (For Tech Team Use)
              </summary>
              <pre className="mt-2 p-3 max-h-40 overflow-auto text-left text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md whitespace-pre-wrap break-words">
                {scanState.error}
              </pre>
            </details>
          )}
        </div>
      </div>
    </>
  );
};

interface ScannerPageProps {
  availableStations: {
    checkIn: boolean;
    food: boolean;
    events: boolean;
  };
}

const ScannerPage: NextPage<ScannerPageProps> = ({ availableStations }) => {
  const [wizard, dispatch] = useReducer(wizardReducer, initialWizardState);

  const renderWizardStep = () => {
    switch (wizard.step) {
      case "selectingStation":
        return (
          <StationSelection
            stations={availableStations}
            changeStation={(station) =>
              dispatch({ type: "SELECT_STATION", station })
            }
          />
        );
      case "selectingOption":
        return wizard.station ? (
          <StationConfigSelection
            station={wizard.station.name}
            options={stationOptionsMap[wizard.station.name]}
            changeStationOption={(option) =>
              dispatch({ type: "SELECT_OPTION", option })
            }
            onBack={() => dispatch({ type: "RESET" })}
          />
        ) : null;
      case "ready":
        return wizard.station ? (
          <ScannerUI
            station={wizard.station}
            onReset={() => dispatch({ type: "RESET" })}
          />
        ) : null;
    }
  };

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
            {renderWizardStep()}
          </div>
        </main>
      </Drawer>
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
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

  const availableStations = {
    checkIn:
      userRoles.includes(Role.ADMIN) ||
      userRoles.includes(Role.GENERAL_SCANNER),
    food:
      userRoles.includes(Role.ADMIN) || userRoles.includes(Role.FOOD_MANAGER),
    events:
      userRoles.includes(Role.ADMIN) || userRoles.includes(Role.EVENT_MANAGER),
  };

  return {
    props: {
      availableStations,
    },
  };
};

export default ScannerPage;
