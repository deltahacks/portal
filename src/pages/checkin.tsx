import type {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextPage,
} from "next";
import Head from "next/head";
import { getSession, signOut, useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import ThemeToggle from "../components/ThemeToggle";
import Link from "next/link";
import Background from "../components/Background";
import NavBar from "../components/NavBar";
import SocialButtons from "../components/SocialButtons";
import { Status } from "@prisma/client";
import dynamic from "next/dynamic";
import { useDeferredValue, useState } from "react";
import { useRouter } from "next/router";
import { rbac } from "../components/RBACWrapper";
import { getServerAuthSession } from "../server/common/get-server-auth-session";

const QRReaderDynamic = dynamic(() => import("../components/QrScanner"), {
  ssr: false,
});

const PreCheckedIn: React.FC = () => {
  const [shouldShow, setShouldShow] = useState(false);
  const [shouldShowScanner, setShouldShowScanner] = useState(false);
  const [QRCode, setQRCode] = useState("NONE");
  const qrDefer = useDeferredValue(QRCode);
  const [scanDelay, setScanDelay] = useState<boolean | number>(10);
  const [error, setError] = useState(null);

  const doCheckIn = trpc.useMutation("application.checkIn");
  const router = useRouter();

  console.log("Rendering...");

  return (
    <div>
      <div className="pt-6 pb-6 text-xl font-normal dark:text-[#737373] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        Welcome to DeltaHacks 9! This year we are using a QR code system to
        check you in to events, meals, and more. To link your account to the QR,
        please scan it with your camera.
      </div>

      <button
        className="btn btn-primary w-48 border-none bg-zinc-700 text-base font-medium capitalize hover:bg-zinc-800"
        onClick={() => {
          setShouldShowScanner(true);
          setShouldShow(!shouldShow);
        }}
      >
        Toggle Camera
      </button>
      <input
        type="checkbox"
        id="my-modal-3"
        className="modal-toggle"
        checked={shouldShow}
      />
      <div className="modal">
        <div className="modal-box relative">
          <span>{error !== null ? error : null}</span>
          <div className="">
            <div>
              {shouldShowScanner ? (
                <QRReaderDynamic
                  scanDelay={scanDelay}
                  handleScan={(data) => {
                    setQRCode(data);
                    // console.log("WTF HUH", data);
                    setScanDelay(false);
                    setShouldShowScanner(false);
                  }}
                  lastVal={qrDefer}
                />
              ) : null}
            </div>
          </div>

          <h3 className="text-md py-1">
            QR Value Scanned: <div className="text-2xl font-bold">{QRCode}</div>
          </h3>

          <div className="flex w-full justify-between gap-4">
            <button
              disabled={QRCode === "NONE"}
              className="btn btn-primary flex-1 border-none text-base font-medium capitalize"
              onClick={async () => {
                try {
                  await doCheckIn.mutateAsync(parseInt(QRCode));
                  await router.push("/dashboard");
                  setShouldShow(!shouldShow);
                } catch (e: any) {
                  setError(e.message);
                }
              }}
            >
              Link QR Value
            </button>
            <button
              className="btn btn-error flex-1 border-none text-base font-medium capitalize"
              disabled={QRCode === "NONE"}
              onClick={async () => {
                await router.reload();
              }}
            >
              Reset
            </button>
          </div>

          <p className="py-4">
            Once you have linked a QR code to your account, it cannot be undone.
            Ensure the QR value on your pass matches the scanned value.
          </p>
        </div>
      </div>
      <div className="pt-6 text-xl font-normal dark:text-[#737373] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        How To Link
      </div>
      <h2 className="pb-6 text-xl font-normal dark:text-[#737373] sm:text-2xl lg:pt-2 lg:text-3xl lg:leading-tight 2xl:pt-4 2xl:text-4xl">
        1. Grab a QR code from our sign in desk <br />
        2. Scan your QR code to link it to your profile
      </h2>
      <div className="pt-2 text-xl font-normal dark:text-[#737373] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        If you are having any issues scanning the QR code, ensure you are
        scanning the code head-on from a moderate distance away. If issues
        persist, speak to a registration volunteer.
      </div>
    </div>
  );
};

const PostCheckedIn: React.FC = () => {
  return (
    <div className="pt-6 text-xl font-normal dark:text-[#737373] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
      Your QR code has been successfully linked! Show your QR code to volunteers
      at events to sign in. <br />
      Happy hacking!
    </div>
  );
};

const NoRSVP: React.FC = () => {
  return (
    <div className="pt-6 text-xl font-normal dark:text-[#737373] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
      You have not RSVPed to DeltaHacks 9. If you believe there is an issue
      regarding this, contact us at{" "}
      <a href="mailto: hello@deltahacks.com" className="text-sky-400">
        hello@deltahacks.com
      </a>
      .
    </div>
  );
};
const Checkin: NextPage = () => {
  const { data: session } = useSession();

  const { data: status, isSuccess: isStatusLoading } = trpc.useQuery([
    "application.status",
  ]);

  const stateMap = {
    [Status.IN_REVIEW]: <></>,
    [Status.ACCEPTED]: <PreCheckedIn />,
    [Status.WAITLISTED]: <></>,
    [Status.REJECTED]: <></>,
    [Status.RSVP]: <PreCheckedIn />,
    [Status.CHECKED_IN]: <PostCheckedIn />,
  };

  return (
    <>
      <Head>
        <title>Check In - DeltaHacks 9</title>
      </Head>
      <div className="drawer drawer-end relative h-full min-h-screen w-full overflow-x-hidden font-montserrat">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <Background />
          <NavBar />
          <main className="px-7 py-16 sm:px-14 md:w-10/12 lg:pl-20 2xl:w-8/12 2xl:pt-20">
            <h1 className="text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl">
              Check In
            </h1>
            {!isStatusLoading ? (
              <h1 className="pt-6 text-xl font-normal dark:text-[#737373] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
                Loading...
              </h1>
            ) : (
              stateMap[status as Status]
            )}
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

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  let output: GetServerSidePropsResult<Record<string, unknown>> = { props: {} };
  output = rbac(
    await getServerAuthSession(context),
    ["ADMIN"],
    undefined,
    output
  );
  return output;
};

export default Checkin;
