import { GetServerSidePropsContext, NextPage } from "next";
import QRCode from "react-qr-code";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { prisma } from "../server/db/client";
import ThemeToggle from "../components/ThemeToggle";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Head from "next/head";
import Background from "../components/Background";
import NavBar from "../components/NavBar";
import SocialButtons from "../components/SocialButtons";
import { trpc } from "../utils/trpc";
import { useEffect, useRef, useState } from "react";
import auto from "@formkit/auto-animate";
import clsx from "clsx";
import { useRouter } from "next/router";

const Me: NextPage = () => {
  const { data: session } = useSession();

  const { data, isLoading, isError, isSuccess } =
    trpc.application.getUser.useQuery();

  const { data: qrcode } = trpc.application.qr.useQuery();

  const [showPrivate, setShowPrivate] = useState<boolean>(false);

  const parent = useRef(null);

  useEffect(() => {
    parent.current && auto(parent.current);
  }, [parent, showPrivate]);

  const router = useRouter();
  const [rickCount, setRick] = useState(0);
  const RickRoll = async () => {
    setRick(rickCount + 1);
    console.log(rickCount);
    if (rickCount === 5) {
      await router.push("https://www.youtube.com/watch?v=q-Y0bnx6Ndw");
    }
  };

  return (
    <>
      <Head>
        <title>Dashboard - DeltaHacks 9</title>
      </Head>

      <div className="drawer drawer-end relative h-full min-h-screen w-full overflow-x-hidden font-montserrat">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

        <div className="drawer-content h-full">
          <Background />
          <NavBar />
          <main className="-transform-x-1/2  static left-1/2 top-1/2 flex flex-col items-center justify-center px-7 py-16 sm:px-14 md:flex-row md:gap-4 lg:pl-20 2xl:w-8/12 2xl:pt-20 ">
            {/* <div className="absolute right-52 w-fit">
              <div className="alert alert-info bg-[#570df8] text-white shadow-lg">
                <div>
                  <span>
                    Press on the QR card <br></br>to see more info.
                  </span>
                </div>
              </div>
            </div> */}

            <div className=" -mb-8 w-36 overflow-hidden rounded-full border-2 border-white md:w-52">
              <img
                className="w-full"
                referrerPolicy="no-referrer"
                src={session?.user?.image || ""}
                alt="profile-picture.png"
              />
            </div>
            <div
              className="rounded-lg bg-white p-4"
              onClick={() => (setShowPrivate(!showPrivate), RickRoll())}
              ref={parent}
            >
              <h1 className="pb-2 text-3xl font-bold text-black">
                {data?.typeform?.firstName} {data?.typeform?.lastName}
              </h1>
              <p className={clsx({ "text-black": true, "pb-5": !showPrivate })}>
                {/* <p className="pb-5 text-black"> */}
                Meals taken :{" "}
                <span className="text-md">
                  {data?.mealData.mealsTaken}
                </span>{" "}
                <span className="text-md">/ 4</span>
              </p>
              {showPrivate && (
                <div className="pb-2">
                  <p className="text-md text-black">
                    Birthdate: {data?.typeform?.birthday.toLocaleDateString()}
                  </p>
                  <p className="text-md text-black">
                    Last Meal:{" "}
                    {data?.mealData?.lastMeal?.toLocaleDateString() ||
                      "No meal taken yet"}
                  </p>
                </div>
              )}

              {qrcode ? (
                <QRCode
                  className="h-auto w-full max-w-full"
                  size={256}
                  value={qrcode.toString()}
                  viewBox={`0 0 256 256`}
                  values={"H"}
                />
              ) : null}

              <h1 className=" text-3xl font-bold text-black">{qrcode}</h1>
            </div>
            <div
              className="absolute bottom-0 left-0 rotate-180 text-[8px]"
              style={{ writingMode: "vertical-rl" }}
            >
              Find the easter egg
            </div>
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
              {/*
              <li>
                <a className="mx-2 my-2 text-base font-bold" href="#">
                  Calendar
                </a>
              </li> */}
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
                  className="font-sub rounded bg-primary px-2.5 py-2.5 text-sm font-bold text-white"
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
  context: GetServerSidePropsContext,
) => {
  const session = await getServerAuthSession(context);

  if (!session || !session.user) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  const userEntry = await prisma.user.findFirst({
    where: { id: session.user.id },
  });

  if (
    userEntry &&
    (userEntry.qrcode === null || userEntry.qrcode === undefined)
  ) {
    return { redirect: { destination: "/checkin", permanent: false } };
  }
  return { props: {} };
};

export default Me;
