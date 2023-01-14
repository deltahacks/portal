import { Role } from "@prisma/client";
import { GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import Background from "../components/Background";
import NavBar from "../components/NavBar";
import SocialButtons from "../components/SocialButtons";
import Link from "next/link";
import ThemeToggle from "../components/ThemeToggle";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useDeferredValue, useEffect, useState } from "react";
import QrScanner from "../components/QrScanner";
import dynamic from "next/dynamic";
import { trpc } from "../utils/trpc";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import clsx from "clsx";

const QRReaderDynamic = dynamic(() => import("../components/QrScanner"), {
  ssr: false,
});

const ConstantQRReaderDynamic = dynamic(
  () => import("../components/QrScanner2"),
  {
    ssr: false,
  }
);

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
  const [email, setEmail] = useState(null);
  const qrDefer = useDeferredValue(QRCode);
  const utils = trpc.useContext();
  const [value, setValue] = useState("");

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

  const cb = useCallback(
    async (data: string) => {
      setQRCode(data);
      setScanDelay(false);
      await utils.invalidateQueries(["food.getFood"]);
    },
    [utils]
  );
  return (
    <>
      <div>
        {
          <ConstantQRReaderDynamic
            // scanDelay={scanDelay}
            callback={cb}
            // lastVal={qrDefer}
            delay={1000}
          />
        }
      </div>
      <h3 className="text-md py-1">
        QR Value Scanned: <div className="text-2xl font-bold">{QRCode}</div>
      </h3>
      <h1>
        {" "}
        Last Time Eaten:{" "}
        {isError
          ? "not food data"
          : `${foodData?.lastMeal?.toDateString()} ${foodData?.lastMeal?.toLocaleTimeString()}`}
      </h1>
      <h1>
        Food Tickets Redeemed:{" "}
        {isError ? "not food data" : foodData?.mealsTaken}
      </h1>
      <div className="form-control">
        <div className="input-group pb-4">
          <input
            type="text"
            placeholder="QR CODE"
            className="input input-bordered"
            maxLength={7}
            minLength={7}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            pattern="[0-9]*"
          />
          <button className="btn btn-primary" onClick={() => setQRCode(value)}>
            Submit
          </button>
        </div>
      </div>
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
  const sendResumeEmail = trpc.useMutation("sponsor.sendResumeEmail");
  const [error, setError] = useState("");
  const { data: session } = useSession();
  const utils = trpc.useContext();
  const {
    data: getResume,
    isLoading,
    isError,
  } = trpc.useQuery(
    [
      "sponsor.getResume",
      { qrcode: parseInt(QRCode), email: session?.user?.email ?? "" },
    ],
    {
      enabled: qrDefer !== "NONE",
      retry: 0,
    }
  );

  useEffect(() => {
    if (getResume) {
      setShouldShowScanner(false);
    }
  }, [getResume]);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError("");
      }, 2000);
    }
  }, [error]);

  return (
    <div className="my-4 h-full w-full pb-24 md:h-[200%]">
      <div>
        {shouldShowScanner ? (
          <QRReaderDynamic
            callback={async (data) => {
              setQRCode(data);
              setScanDelay(false);
              await utils.invalidateQueries(["sponsor.getResume"]);
            }}
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
      <div className="pb-4 font-semibold text-red-500">
        {error ? error : null}
      </div>
      <div className="mt-6 flex flex-wrap gap-4">
        <button
          className="btn btn-primary"
          onClick={async () => {
            if (QRCode === "NONE") {
              setError("Please scan a QR Code");
            } else {
              await sendResumeEmail.mutateAsync({
                qrcode: parseInt(QRCode),
                email: session?.user?.email ?? "",
              });
              setQRCode("NONE");
              setShouldShowScanner(true);
            }
          }}
        >
          Send Me This Resume!
        </button>
        {/*<button
          className="btn btn-primary"
          onClick={() => {
            setQRCode("NONE");
            setShouldShowScanner(true);
          }}
        >
          Reset Scanner
        </button>*/}
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
            // scanDelay={scanDelay}
            callback={(data) => {
              setQRCode(data);
              // setScanDelay(false);
              setShouldShowScanner(false);
            }}
            // lastVal={qrDefer}
          />
        ) : null}
      </div>
      <div className="w-full">
        {!shouldShowScanner ? (
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="flex w-full flex-col">
              <div>
                <h1 className="w-full pt-8 text-2xl font-semibold leading-tight text-black dark:text-white sm:pt-6 sm:text-3xl lg:pt-8 lg:text-5xl 2xl:text-6xl">
                  <div className="font-light lg:pb-1">✌️Hello, I am</div>
                  {socialInfo?.firstName}&nbsp;
                  {socialInfo?.lastName}
                </h1>
                <h2 className="text-md pt-1 font-normal dark:text-[#737373] sm:py-2 sm:pt-2 sm:text-lg lg:text-2xl lg:leading-tight 2xl:pt-4 2xl:text-3xl">
                  I am a{" "}
                  {socialInfo?.currentLevel?.replace(
                    "High School",
                    "High Schooler"
                  )}{" "}
                  attending {socialInfo?.school} for {socialInfo?.major}{" "}
                  at&nbsp;
                  {socialInfo?.degree} level!
                </h2>
              </div>
              <h1 className="w-full pt-8 text-xl font-semibold leading-tight text-black dark:text-white sm:py-2 sm:pt-6 sm:text-2xl lg:text-3xl 2xl:text-4xl">
                <div className="font-light">Learn More About Me:</div>
              </h1>
              <hr></hr>
              <h3 className="text-black dark:text-white">
                {socialInfo?.socialLinks?.map((link, i) => (
                  <a
                    key={i}
                    className="block py-2 font-medium transition ease-in-out hover:text-[#833bff] dark:hover:text-[#9575cc] sm:py-2 "
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <h1 className="text-base sm:text-xl lg:text-2xl ">
                      {link}
                    </h1>
                  </a>
                ))}
              </h3>
            </div>
            <div className="flex w-full justify-center p-8 ">
              <img
                className="h-auto w-full max-w-full rounded-xl lg:w-3/4"
                src={socialInfo?.image || ""}
              ></img>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

const EventsView: React.FC = () => {
  // const [scanDelay, setScanDelay] = useState<boolean | number>(10);
  const [QRCode, setQRCode] = useState("NONE");
  // const qrDefer = useDeferredValue(QRCode);

  const events = [
    "REGISTRATION",
    "OPENING CEREMONY",
    "GROUP FORMATION",
    "GITHUB BASICS & ESSENTIALS",
    "RBC EMPLOYER EVENT - RESUME ROAST",
    "GRAPH QL WORKSHOP W/ HYPERCARE",
    "FIRE NOODLE CHALLENGE",
    "SPONSOR SHOWCASE",
    "BOARD GAME LOUNGE OPENS",
    "ANDROID APP WITH AFZAL NAJAM",
    "JAX WORKSHOP",
    "MACHINE LEARNING WORKSHOP, CREATE AN APP FROM SCRATCH",
    "REACT WORKSHOP",
    "CUP STACKING",
    "SMASH EVENT",
    "TALK WITH FUAD",
    "CLOSING CEREMONY",
  ];

  const [selected, setSelected] = useState(events[0]);

  const eCheckIn = trpc.useMutation("events.checkin");

  useEffect(() => {
    const asdf = async () => {
      console.log(QRCode, selected);
      if (!Number.isNaN(parseInt(QRCode)) && selected) {
        await eCheckIn.mutateAsync({
          qrcode: parseInt(QRCode),
          eventName: selected,
        });
      }
    };
    asdf();
  }, [QRCode, selected]);

  return (
    <div>
      <div>
        {
          <ConstantQRReaderDynamic
            callback={(data: string) => {
              setQRCode(data);
            }}
            delay={1000}
          />
        }
      </div>
      <h3 className="text-md py-1">
        QR Value Scanned: <div className="text-2xl font-bold">{QRCode}</div>
      </h3>
      <div>
        <h1 className="py-8 text-2xl font-bold">
          Choose an Event (you can scroll)
        </h1>
        <div
          tabIndex={0}
          className="max-h-60 overflow-y-scroll rounded-2xl bg-transparent p-4"
        >
          {events.map((event) => {
            return (
              <div
                key={event}
                onClick={() => {
                  setQRCode("");
                  setSelected(event);
                }}
                className={clsx({
                  "btn mb-4 flex w-full items-center justify-center": true,
                  "btn-primary": selected !== event,
                  "btn-success": selected === event,
                })}
              >
                {event}
              </div>
            );
          })}
        </div>
        <div className="py-8">Currently scanning for: {selected}</div>
      </div>
    </div>
  );
};

const Scanner: NextPage = () => {
  const { data: session, status } = useSession();
  const stateMap = new Map<string, React.ReactElement>();
  //stateMap.set(Role.ADMIN, <SponsorView />);
  stateMap.set(Role.FOOD_MANAGER, <FoodManagerView />);
  stateMap.set(Role.HACKER, <HackerView />);
  stateMap.set(Role.EVENT_MANAGER, <EventsView />);
  stateMap.set(Role.SPONSER, <SponsorView />);

  const [selectedTab, setSelectedTab] = useState("HACKER");

  return (
    <>
      <Head>
        <title>Check In - DeltaHacks 9</title>
      </Head>
      <div className="drawer drawer-end relative h-full min-h-screen w-full overflow-x-hidden font-montserrat">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          <Background />
          <NavBar />

          <main className="px-7 py-16 sm:px-14 md:w-10/12 lg:pl-20 2xl:w-8/12 2xl:pt-20">
            <h1 className="mb-4 text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl">
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

          <footer className="absolute right-0 bottom-0 p-5 md:absolute md:bottom-0">
            <SocialButtons />
          </footer>
        </div>

        <footer className="absolute bottom-0 right-0 p-5 md:absolute md:bottom-0">
          <SocialButtons />
        </footer>
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

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);

  if (!session || !session.user) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { props: {} };
};

export default Scanner;
