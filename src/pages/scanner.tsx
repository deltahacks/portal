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
      <h3 className="py-1 text-md">
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

      <div className="flex justify-between w-full gap-4">
        <button
          disabled={QRCode === "NONE"}
          className="flex-1 text-base font-medium capitalize border-none btn btn-primary"
          onClick={async () => {
            await foodMutationAdd.mutateAsync(parseInt(QRCode));
            await utils.invalidateQueries(["food.getFood"]);
          }}
        >
          +
        </button>
        <button
          disabled={QRCode === "NONE"}
          className="flex-1 text-base font-medium capitalize border-none btn btn-primary"
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
          <div>
            <QRReaderDynamic
              scanDelay={scanDelay}
              handleScan={(data) => {
                setQRCode(data);
                setScanDelay(false);
                setShouldShowScanner(false);
              }}
              lastVal={qrDefer}
            />
          </div>
        ) : null}
      </div>
      <div className="w-full">
        {!shouldShowScanner ? (
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="flex flex-col">
              <div>
                <h1 className="w-full pt-8 text-2xl font-semibold leading-tight text-black dark:text-white sm:py-2 sm:pt-4 sm:text-3xl lg:text-5xl 2xl:text-6xl">
                  {socialInfo?.firstName},&nbsp;{socialInfo?.lastName}
                </h1>
                <h2 className="pt-2 text-xl font-normal dark:text-[#737373] sm:py-2 sm:pt-0 sm:text-2xl lg:pt-2 lg:text-3xl lg:leading-tight 2xl:pt-6 2xl:text-4xl">
                  {socialInfo?.school},&nbsp;{socialInfo?.degree},&nbsp;
                  {socialInfo?.currentLevel}
                </h2>
              </div>
              <h3 className="pt-4 text-black dark:text-white lg:pt-6">
                {socialInfo?.socialLinks?.map((link, i) => (
                  <a
                    key={i}
                    className="block py-2 font-medium transition ease-in-out hover:text-[#833bff] dark:hover:text-[#9575cc] sm:py-4 "
                    href={link}
                    target="_blank"
                  >
                    <h1 className="text-base sm:text-xl lg:text-2xl ">
                      {link}
                    </h1>
                  </a>
                ))}
              </h3>
            </div>
            <img
              className="w-full h-auto max-w-full p-8 md:w-1/2"
              src={socialInfo?.image || ""}
            ></img>
          </div>
        ) : null}
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
  stateMap.set(Role.ADMIN, <FoodManagerView />);
  stateMap.set(Role.FOOD_MANAGER, <FoodManagerView />);
  stateMap.set(Role.HACKER, <HackerView />);
  stateMap.set(Role.REVIEWER, <FoodManagerView />);

  const [selectedTab, setSelectedTab] = useState("HACKER");

  return (
    <>
      <Head>
        <title>Check In - DeltaHacks 9</title>
      </Head>
      <div className="relative w-full h-full min-h-screen overflow-x-hidden drawer drawer-end font-montserrat">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <Background />
          <NavBar />

          <main className="py-16 px-7 sm:px-14 md:w-10/12 lg:pl-20 2xl:w-8/12 2xl:pt-20">
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
          </main>

          <footer className="absolute bottom-0 right-0 p-5 md:absolute md:bottom-0">
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
            <div className="flex items-center justify-between w-full mx-1 mb-2">
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
