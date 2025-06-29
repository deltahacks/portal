import { Role } from "@prisma/client";
import { GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import SocialButtons from "../components/SocialButtons";
import { useSession } from "next-auth/react";

import { useCallback, useDeferredValue, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { trpc } from "../utils/trpc";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import clsx from "clsx";
import Drawer from "../components/Drawer";

const QRReaderDynamic = dynamic(() => import("../components/QrScanner"), {
  ssr: false,
});

const ConstantQRReaderDynamic = dynamic(
  () => import("../components/QrScanner2"),
  {
    ssr: false,
  },
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
  const [QRCode, setQRCode] = useState("NONE");
  const qrDefer = useDeferredValue(QRCode);
  const foodUtils = trpc.useUtils();
  const [value, setValue] = useState("");

  const { data: foodData, isError } = trpc.food.getFood.useQuery(
    parseInt(QRCode),
    {
      enabled: qrDefer !== "NONE",
      retry: 0,
    },
  );
  const foodMutationAdd = trpc.food.addFood.useMutation();
  const foodMutationSub = trpc.food.subFood.useMutation();

  const cb = useCallback(
    async (data: string) => {
      setQRCode(data);
      await foodUtils.food.getFood.invalidate();
    },
    [foodUtils],
  );
  return (
    <>
      <div>
        {
          <ConstantQRReaderDynamic
            callback={cb}
            // lastVal={qrDefer}
            delay={1000}
          />
        }
      </div>
      <div className="flex items-center justify-center">
        <div className="mt-6 flex flex-wrap items-center gap-10">
          <div className=" mb-5 flex flex-col gap-5 rounded bg-gray-600 p-10 md:flex-row">
            <div className="flex flex-col gap-5">
              <h1 className="font-bold text-white">
                {" "}
                Last Time Eaten:{" "}
                {isError
                  ? "not food data"
                  : `${foodData?.lastMeal?.toDateString()} ${foodData?.lastMeal?.toLocaleTimeString()}`}
              </h1>
              <h1 className="font-bold text-white">
                Food Tickets Redeemed:{" "}
                {isError ? "not food data" : foodData?.mealsTaken}
              </h1>
              <div className="flex gap-10">
                <button
                  disabled={QRCode === "NONE"}
                  className="btn btn-primary flex-1 border-none text-base font-medium capitalize"
                  onClick={async () => {
                    await foodMutationAdd.mutateAsync(parseInt(QRCode));
                    await foodUtils.food.getFood.invalidate();
                  }}
                >
                  Reedem ticket
                </button>
                <button
                  disabled={QRCode === "NONE"}
                  className="btn btn-primary flex-1 border-none text-base font-medium capitalize"
                  onClick={async () => {
                    await foodMutationSub.mutateAsync(parseInt(QRCode));
                    await foodUtils.food.getFood.invalidate();
                  }}
                >
                  Revert Redemption
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <h1 className="text-white">Lookup using hackerID :</h1>
              <fieldset className="fieldset">
                <div className="join pb-4">
                  <input
                    type="text"
                    placeholder="QR CODE"
                    className="input join-item"
                    maxLength={7}
                    minLength={7}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    pattern="[0-9]*"
                  />
                  <button
                    className="btn btn-primary join-item"
                    onClick={() => setQRCode(value)}
                  >
                    Submit
                  </button>
                </div>
              </fieldset>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full justify-between gap-4"></div>
    </>
  );
};

const SponsorView: React.FC = () => {
  const [QRCode, setQRCode] = useState("NONE");
  const [shouldShowScanner, setShouldShowScanner] = useState(true);
  const qrDefer = useDeferredValue(QRCode);
  const sendResumeEmail = trpc.sponsor.sendResumeEmail.useMutation();
  const [error, setError] = useState("");
  const { data: session } = useSession();
  const sponsorUtils = trpc.useUtils();
  const [value, setValue] = useState("");
  const { data: getResume } = trpc.sponsor.getResume.useQuery(
    { qrcode: parseInt(QRCode), email: session?.user?.email ?? "" },
    {
      enabled: qrDefer !== "NONE",
      retry: 0,
    },
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
              await sponsorUtils.sponsor.getResume.invalidate();
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
      <div className="flex items-center justify-center">
        <div className="mt-6 flex flex-wrap items-center gap-10">
          <div className="mb-5 flex flex-col gap-5 rounded bg-gray-600 p-10">
            <h1 className="text-white">Lookup using hackerID :</h1>
            <fieldset className="fieldset">
              <div className="join pb-4">
                <input
                  type="text"
                  placeholder="QR CODE"
                  className="input join-item"
                  maxLength={7}
                  minLength={7}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  pattern="[0-9]*"
                />
                <button
                  className="btn btn-primary join-item"
                  onClick={() => setQRCode(value)}
                >
                  Submit
                </button>
              </div>
            </fieldset>
          </div>
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
        </div>
      </div>
    </div>
  );
};

const HackerView: React.FC = () => {
  const [QRCode, setQRCode] = useState("NONE");
  const qrDefer = useDeferredValue(QRCode);
  const [shouldShowScanner, setShouldShowScanner] = useState(true);
  const [value, setValue] = useState("");
  const { data: socialInfo } = trpc.application.socialInfo.useQuery(
    parseInt(QRCode),
    {
      enabled: qrDefer !== "NONE",
      retry: 0,
    },
  );

  return (
    <>
      <div>
        {shouldShowScanner ? (
          <QRReaderDynamic
            callback={(data) => {
              setQRCode(data);
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
                {socialInfo?.role?.includes(Role.ADMIN) ? (
                  <h2 className="text-md pt-1 font-normal dark:text-[#737373] sm:py-2 sm:pt-2 sm:text-lg lg:text-2xl lg:leading-tight 2xl:pt-4 2xl:text-3xl">
                    I am one of the <span className="text-[#f8d868]">Del</span>
                    <span className="text-[#eb4b63]">taha</span>
                    <span className="text-[#52b5c7]">cks</span> organizers. Ask
                    me whatever you want :)
                  </h2>
                ) : (
                  <h2 className="text-md pt-1 font-normal dark:text-[#737373] sm:py-2 sm:pt-2 sm:text-lg lg:text-2xl lg:leading-tight 2xl:pt-4 2xl:text-3xl">
                    I am a{" "}
                    {socialInfo?.currentLevel?.replace(
                      "High School",
                      "High Schooler",
                    )}{" "}
                    attending {socialInfo?.school} for {socialInfo?.major}{" "}
                    at&nbsp;
                    {socialInfo?.degree} level!
                  </h2>
                )}
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
              <div className="h-auto w-full max-w-full rounded-xl lg:w-3/4">
                <Image
                  alt="social-info"
                  src={socialInfo?.image || ""}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              {/* TODO below is previous code. I can't check the code on my system rn because logging
              in doesn't work, so check that it works later
              <img
                className="h-auto w-full max-w-full rounded-xl lg:w-3/4"
                alt="social-info"
                src={}
              /> */}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <div className="mt-6 flex flex-wrap items-center gap-10">
              <div className="mb-5 flex flex-col gap-5 rounded bg-gray-600 p-10">
                <h1 className="text-white">Lookup using hackerID :</h1>
                <fieldset className="fieldset">
                  <div className="join pb-4">
                    <input
                      type="text"
                      placeholder="QR CODE"
                      className="input join-item"
                      maxLength={7}
                      minLength={7}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      pattern="[0-9]*"
                    />
                    <button
                      className="btn btn-primary join-item"
                      onClick={() => (
                        setQRCode(value),
                        setShouldShowScanner(false)
                      )}
                    >
                      Submit
                    </button>
                  </div>
                </fieldset>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const EventsView: React.FC = () => {
  const [QRCode, setQRCode] = useState("NONE");
  const [value, setValue] = useState("");

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

  const eCheckIn = trpc.events.checkin.useMutation();

  // useEffect(() => {
  //   const asdf = async () => {
  //     console.log(QRCode, selected);
  //     if (!Number.isNaN(parseInt(QRCode)) && selected) {
  //       await eCheckIn.mutateAsync({
  //         qrcode: parseInt(QRCode),
  //         eventName: selected,
  //       });
  //     }
  //   };
  //   asdf();
  // }, [QRCode, selected, eCheckIn]);

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
      <div className="flex items-center justify-center">
        <div className="mt-6 flex flex-wrap items-center gap-10">
          <div className="mb-5 flex flex-col gap-5 rounded bg-gray-600 p-10">
            <h1 className="text-white">Lookup using hackerID :</h1>
            <fieldset className="fieldset">
              <div className="join pb-4">
                <input
                  type="text"
                  placeholder="QR CODE"
                  className="input join-item"
                  maxLength={7}
                  minLength={7}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  pattern="[0-9]*"
                />
                <button
                  className="btn btn-primary join-item"
                  onClick={() => setQRCode(value)}
                >
                  Submit
                </button>
              </div>
            </fieldset>
          </div>
        </div>
      </div>
    </div>
  );
};

const Scanner: NextPage = () => {
  const { data: session, status } = useSession();
  // Add security guard and events people
  const stateMap = new Map<string, React.ReactElement>();
  stateMap.set(Role.ADMIN, <SponsorView />);
  stateMap.set(Role.FOOD_MANAGER, <FoodManagerView />);
  stateMap.set(Role.HACKER, <HackerView />);
  stateMap.set(Role.REVIEWER, <FoodManagerView />);
  stateMap.set(Role.EVENT_MANAGER, <EventsView />);
  stateMap.set(Role.SPONSER, <SponsorView />);

  const [selectedTab, setSelectedTab] = useState("HACKER");

  return (
    <>
      <Head>
        <title>Check In - DeltaHacks XI</title>
      </Head>
      <Drawer pageTabs={[{ pageName: "Dashboard", link: "/dashboard" }]}>
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
              <div className="tabs tabs-box">
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
      </Drawer>
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  // FIXME: Disable this page temporarily
  return { redirect: { destination: "/", permanent: false } };

  // const session = await getServerAuthSession(context);

  // if (!session || !session.user) {
  //   return { redirect: { destination: "/login", permanent: false } };
  // }
  // return { props: {} };
};

export default Scanner;
