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
  station: Station;
  scanState: ScanState;
  onScan: (value: string) => void;
  onError: (message: string) => void;
  onReset: () => void;
  scannedValue: string | null;
}> = ({ station, scanState, onScan, onError, onReset, scannedValue }) => {
  const lastScannedRef = useRef<string | null>(null);

  const handleScan = useCallback(
    (result: { rawValue: string }[]) => {
      const value = result[0]?.rawValue;
      // need to deduplicate scans since scanner keeps firing and would cause infinite re-scans
      if (value && value !== lastScannedRef.current) {
        lastScannedRef.current = value;
        onScan(value);
      }
    },
    [onScan],
  );

  const handleError = useCallback(
    (error: unknown) => {
      console.error(error);
      onError("Camera error. Please try again.");
    },
    [onError],
  );

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-black dark:text-white">
            Station:
          </span>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary text-white">
            {stationLabels[station]}
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

  const [scannedValue, setScannedValue] = useState<string | null>(null);
  const [scanState, setScanState] = useState<ScanState>({ status: "idle" });

  const { queuedItems, addToQueue, removeFromQueue } =
    useOfflineQueue<ScannerQueueItem>();
  const hasProcessedInitialQueue = useRef(false);

  // scanner persistence works by adding any scanned qr code to the offline queue and removing them
  // only when the mutaiton is succesful. This is because tanstack already retries failed mutation until success.
  // Saving in the local storage is only for persistence across page reloads.
  const scannerMutation = trpc.scanner.scan.useMutation({
    onSuccess: (data) => {
      // setScanState({ status: "idle" });
      // remove succesfully mutated ids from offline queue
      if (data?.id) {
        removeFromQueue(data.id);
      }
    },
    onError: (error) => {
      console.error(error);
      // setScanState({ status: "idle" });
      // setScanState({
      //   status: "error",
      //   message: error.message || "Failed to check in user. Please try again.",
      // });
    },
  });

  // Need acccess to stable mutation function
  // @see https://github.com/TanStack/query/issues/1858
  const { mutate: scan } = scannerMutation;

  useEffect(() => {
    // On page load, re-mutate any queued items
    if (!hasProcessedInitialQueue.current && queuedItems.length > 0) {
      hasProcessedInitialQueue.current = true;
      queuedItems.forEach((item) => {
        scan({ id: item.id, station: item.station });
      });
    }
  }, [queuedItems, scan]);

  const processScan = useCallback(
    (value: string) => {
      if (!wizard.station) return;

      setScannedValue(value);

      const isValidCuid = z.cuid().safeParse(value).success;
      if (!isValidCuid) {
        setScanState({
          status: "error",
          message: "Invalid QR code format. Please scan a valid attendee pass.",
        });
        return;
      }

      setScanState({ status: "success" });
      addToQueue({ id: value, station: wizard.station });
      scan({
        id: value,
        station: wizard.station,
      });
    },
    [wizard.station, addToQueue, scan],
  );

  const handleReset = useCallback(() => {
    dispatch({ type: "RESET" });
    setScannedValue(null);
    setScanState({ status: "idle" });
  }, []);

  const handleScanError = useCallback((message: string) => {
    setScanState({ status: "error", message });
  }, []);

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
            station={wizard.station.name}
            scanState={scanState}
            onScan={processScan}
            onError={handleScanError}
            onReset={handleReset}
            scannedValue={scannedValue}
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
