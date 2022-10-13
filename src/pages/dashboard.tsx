import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  NextPage,
} from "next";
import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useEffect } from "react";
import Background from "../components/Background";
import NavBar from "../components/NavBar";
import SocialButtons from "../components/SocialButtons";
import ThemeToggle from "../components/ThemeToggle";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { appRouter } from "../server/router";
import { createContext } from "../server/router/context";
import { trpc } from "../utils/trpc";

const Dashboard: NextPage = () => {
  const { data: applicationRecieved, isLoading } = trpc.useQuery([
    "application.received",
  ]);

  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>Dashboard - DeltaHacks 9</title>
      </Head>
      <div className="drawer drawer-end relative h-full min-h-screen w-full overflow-x-hidden font-montserrat">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <Background />
          <NavBar />

          <main className="px-7 py-16 sm:px-14 md:absolute md:w-10/12 md:pb-3 lg:pl-20 2xl:w-8/12 2xl:pt-20">
            <h1 className="text-2xl font-semibold leading-tight text-black dark:text-white sm:mt-14 sm:text-3xl lg:text-5xl 2xl:text-6xl">
              Thanks for applying{session ? `, ${session.user?.name}` : ""}!
            </h1>
            <h2 className="pt-6 text-xl font-normal dark:text-[#737373] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
              We have recieved your application. You will hear back from us on
              your email. While you wait for DeltaHacks, lookout for other prep
              events by DeltaHacks on our social accounts.
            </h2>
            <div className="pt-6 text-xl font-normal dark:text-[#737373] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
              If you have any questions, you can <br />
              reach us at{" "}
              <a href="mailto: hello@deltahacks.com" className="text-sky-400">
                hello@deltahacks.com
              </a>
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
  context: any,
  ctx: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);

  if (!session || !session.user) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  const trpcCtx = await createContext({ req: context.req, res: context.res });
  const caller = appRouter.createCaller(trpcCtx);
  const result = await caller.query("application.received");

  if (!result) {
    return { redirect: { destination: "/welcome", permanent: false } };
  }

  return { props: {} };
};

export default Dashboard;
