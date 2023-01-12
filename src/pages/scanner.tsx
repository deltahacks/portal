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
import { useEffect, useState } from "react";
import QrScanner from "../components/QrScanner";

const RedirectToDashboard: React.FC = () => {
  const router = useRouter();

  return (
    <div
      onLoad={async () => {
        await router.push("/dashboard");
      }}
    ></div>
  );
};

const FoodManagerView: React.FC = () => {
  return (
    <>
      <QrScanner />
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
  const stateMap = {
    [Role.ADMIN]: <FoodManagerView />,
    [Role.FOOD_MANAGER]: <FoodManagerView />,
    [Role.HACKER]: <RedirectToDashboard />,
    [Role.REVIEWER]: <RedirectToDashboard />,
    // Add security guard and eventes people
  };

  const [selectedTab, setSelectedTab] = useState("HACKER");

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
                {stateMap[selectedTab as Role]}
              </>
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

export default Scanner;
