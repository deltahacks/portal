import { Role } from "@prisma/client";
import { NextPage } from "next";
import Head from "next/head";
import Background from "../components/Background";
import NavBar from "../components/NavBar";
import SocialButtons from "../components/SocialButtons";
import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useDeferredValue, useEffect, useState } from "react";
import QrScanner from "../components/QrScanner";
import dynamic from "next/dynamic";
import { trpc } from "../utils/trpc";
import { router } from "@trpc/server";
import { userAgent } from "next/server";

const QRReaderDynamic = dynamic(() => import("../components/QrScanner"), {
  ssr: false,
});

// const RedirectToDashboard: React.FC = () => {
//   const router = useRouter();

//   return (
//     <div
//       onLoad={async () => {
//         await router.push("/dashboard");
//       }}
//     ></div>
//   );
// };

const FoodManagerView: React.FC = () => {
  //   const [shouldShowScanner, setShouldShowScanner] = useState(true);
  const [scanDelay, setScanDelay] = useState<boolean | number>(10);
  const [QRCode, setQRCode] = useState("NONE");
  const qrDefer = useDeferredValue(QRCode);
  const utils = trpc.useContext();

  const {
    data: foodData,
    isLoading,
    isError,
  } = trpc.useQuery(["food.getFood", parseInt(QRCode)], {
    enabled: qrDefer !== "NONE",
    retry: 0,
  });
  const foodMutationAdd = trpc.useMutation(["food.addFood"]);
  const foodMutationSub = trpc.useMutation(["food.subFood"]);

  return (
    <>
      <div>
        {
          <QRReaderDynamic
            scanDelay={scanDelay}
            handleScan={async (data) => {
              setQRCode(data);
              setScanDelay(false);
              await utils.invalidateQueries(["food.getFood"]);
            }}
            lastVal={qrDefer}
          />
        }
      </div>
      <h3 className="text-md py-1">
        QR Value Scanned: <div className="text-2xl font-bold">{QRCode}</div>
      </h3>
      <h1>
        {" "}
        last food :{" "}
        {isError
          ? "not food data"
          : `${foodData?.lastMeal?.toDateString()} ${foodData?.lastMeal?.toLocaleTimeString()}`}
      </h1>
      <h1>food go brr : {isError ? "not food data" : foodData?.mealsTaken}</h1>

      <div className="flex w-full justify-between gap-4">
        <button
          disabled={QRCode === "NONE"}
          className="btn btn-primary flex-1 border-none text-base font-medium capitalize"
          onClick={async () => {
            await foodMutationAdd.mutateAsync(parseInt(QRCode));
            await utils.invalidateQueries(["food.getFood"]);
          }}
        >
          +
        </button>
        <button
          disabled={QRCode === "NONE"}
          className="btn btn-primary flex-1 border-none text-base font-medium capitalize"
          onClick={async () => {
            await foodMutationSub.mutateAsync(parseInt(QRCode));
            await utils.invalidateQueries(["food.getFood"]);
          }}
        >
          -
        </button>
      </div>
    </>
  );
};

const SponsorView: React.FC = () => {
  const [scanDelay, setScanDelay] = useState<boolean | number>(10);
  const [QRCode, setQRCode] = useState("NONE");
  const [shouldShowScanner, setShouldShowScanner] = useState(true);
  const qrDefer = useDeferredValue(QRCode);
  const utils = trpc.useContext();
  const {
    data: getResume,
    isLoading,
    isError,
  } = trpc.useQuery(["sponsor.getEmail", parseInt(QRCode)], {
    enabled: qrDefer !== "NONE",
    retry: 0,
  });
  console.log(getResume);

  useEffect(() => {
    if (getResume) {
      setShouldShowScanner(false);
    }
  }, [getResume]);

  return (
    <div className="h-full w-full">
      <div>
        {shouldShowScanner ? (
          <QRReaderDynamic
            scanDelay={scanDelay}
            handleScan={async (data) => {
              setQRCode(data);
              setScanDelay(false);
              await utils.invalidateQueries(["sponsor.getEmail"]);
            }}
            lastVal={qrDefer}
          />
        ) : null}
      </div>
      {getResume ? (
        <div className="h-full">
          <iframe
            width="100%"
            height="100%"
            loading="lazy"
            src={getResume.resume || " "}
          ></iframe>
        </div>
      ) : null}
      <div>
        <button>Send Resume To My Email</button>
      </div>
    </div>
  );
};

const HackerView: React.FC = () => {
  const [scanDelay, setScanDelay] = useState<boolean | number>(10);
  const [QRCode, setQRCode] = useState("NONE");
  const qrDefer = useDeferredValue(QRCode);
  const [shouldShowScanner, setShouldShowScanner] = useState(true);
  const { data: socialInfo } = trpc.useQuery(
    ["application.socialInfo", parseInt(QRCode)],
    {
      enabled: qrDefer !== "NONE",
      retry: 0,
    }
  );

  return (
    <>
      <div>
        {shouldShowScanner ? (
          <QRReaderDynamic
            scanDelay={scanDelay}
            handleScan={(data) => {
              setQRCode(data);
              setScanDelay(false);
              setShouldShowScanner(false);
            }}
            lastVal={qrDefer}
          />
        ) : null}
      </div>
      <div>
        <h1>
          {socialInfo?.firstName},{socialInfo?.lastName}
        </h1>
        <h2>
          {socialInfo?.school},{socialInfo?.degree},{socialInfo?.currentLevel}
        </h2>
        <h3>
          {socialInfo?.socialLinks?.map((link, i) => (
            <a key={i} className="block text-blue-400" href={link}>
              {link}
            </a>
          ))}
        </h3>
        <img src={socialInfo?.image || ""}></img>
      </div>
    </>
  );
};
const SecurityGuardView: React.FC = () => {
  return <h1></h1>;
};
const EventsView: React.FC = () => {
  return <h1></h1>;
};

const Scanner: NextPage = () => {
  const { data: session, status } = useSession();
  // Add security guard and events people
  const stateMap = new Map<string, React.ReactElement>();
  stateMap.set(Role.ADMIN, <SponsorView />);
  stateMap.set(Role.FOOD_MANAGER, <FoodManagerView />);
  stateMap.set(Role.HACKER, <HackerView />);
  stateMap.set(Role.REVIEWER, <FoodManagerView />);
  //stateMap.set(Role.SPONSOR, <SponsorView />);

  const [selectedTab, setSelectedTab] = useState("HACKER");

  return (
    <>
      <Head>
        <title>Check In - DeltaHacks 9</title>
      </Head>
      <div className="drawer drawer-end relative flex flex-col h-full overflow-x-hidden font-montserrat">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          <Background />
          <div className="flex-initial"><NavBar /></div>

          <main className="h-full flex-auto">
          <div className="h-full px-7 py-16 sm:px-14 g:pl-20 2xl:pt-20">
            <h1 className="text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl">
              Scanner
            </h1>

            {status == "loading" ? (
              <h1 className="pt-6 text-xl font-normal dark:text-[#737373] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
                Loading...
              </h1>
            ) : (
              <>
                <div className="tabs tabs-boxed">
                  {session?.user?.role.map((e) => {
                    return (
                      <a
                        className={
                          "tab" + (selectedTab == e ? " tab-active" : "")
                        }
                        key={e}
                        onClick={() => {
                          setSelectedTab(e as Role);
                        }}
                      >
                        {e}
                      </a>
                    );
                  })}
                </div>
                {stateMap.get(selectedTab) ?? <h1>Not Found</h1>}
              </>
            )}
          </div>
          </main>

          <footer className="absolute right-0 bottom-0 p-5 md:absolute md:bottom-0">
            <SocialButtons />
          </footer>
        </div>
        <div className="drawer-side md:hidden">
          <label
            htmlFor="my-drawer-3"
            className="drawer-overlay md:hidden"
          ></label>
          <div className="menu h-full w-80 flex-row content-between overflow-y-auto bg-white p-4 dark:bg-[#1F1F1F] md:hidden">
            <ul className="w-full">
              {/* <li>Your application has not been received.</li> */}
              {/* <!-- Sidebar content here --> */}
              <li>
                <Link
                  className="mx-2 my-2 text-base font-bold"
                  href="/dashboard"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
            <div className="mx-1 mb-2 flex w-full items-center justify-between">
              <ThemeToggle />
              <div>
                <a className="font-sub mx-2.5 text-sm">
                  Hi,{" "}
                  <strong className="font-bold">{session?.user?.name}</strong>
                </a>
                <button
                  onClick={() => signOut()}
                  className="font-sub rounded bg-primary py-2.5 px-2.5 text-sm font-bold text-white"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Scanner;
