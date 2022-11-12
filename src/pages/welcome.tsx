import type { GetServerSidePropsContext, NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import Background from "../components/Background";
import NavBar from "../components/NavBar";
import SocialButtons from "../components/SocialButtons";
import ThemeToggle from "../components/ThemeToggle";
import { getServerAuthSession } from "../server/common/get-server-auth-session";

import { appRouter } from "../server/router";
import { createContext } from "../server/router/context";

import { prisma } from "../server/db/client";

const Content = () => {
  return (
    <main className="px-7 py-8 sm:px-14 md:w-10/12 md:py-16 lg:pl-20 2xl:w-8/12 2xl:pt-20">
      <div className="text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-4xl 2xl:text-4xl">
        A weekend worth hacking,
        <br />@ DeltaHacks 9
      </div>
      <div className="pt-6 text-xl font-normal dark:text-[#737373] sm:text-2xl lg:pt-8 lg:text-2xl lg:leading-tight 2xl:pt-10 2xl:text-2xl">
        At DeltaHacks, we believe change comes from dreaming big. Each year we
        enable over 800 students from across North America, working hard over 36
        hours, to bring their big ideas to life. Unleash your creativity and
        make something great, we{"'"}ll handle the rest! Make big ideas a
        reality at DeltaHacks 9!
      </div>
      <div className="pt-6 text-xl font-normal dark:text-[#737373] sm:text-2xl lg:pt-8 lg:text-2xl lg:leading-tight 2xl:pt-10 2xl:text-2xl">
        If you have any questions, you can <br />
        reach us at{" "}
        <a href="mailto: hello@deltahacks.com" className="text-sky-400">
          hello@deltahacks.com
        </a>
      </div>
      <div className="flex flex-col gap-3 pt-6 md:flex-row lg:pt-8 2xl:pt-10">
        <Link href="/apply">
          <button className="btn btn-primary w-48 text-base font-medium capitalize">
            Apply
          </button>
        </Link>
        {/* Hidden until we have a FAQ Page */}
        {/* <Link href="#">
          <button className="btn btn-primary w-48 border-none bg-zinc-700 text-base font-medium capitalize hover:bg-zinc-800">
            FAQ
          </button>
        </Link> */}
      </div>
    </main>
  );
};

// const Content = () => {
//   return (
//     <main>
//       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
//         <div className=" rounded-xl bg-[#e0e0e0] p-5 dark:bg-[#2e2e2e] md:p-32">
//           <h1 className="text-center text-xl">
//             Applications are currently paused due to a technical difficulty.
//             <br></br> Please be paitient while we fix the issue as soon as
//             possible.
//           </h1>
//         </div>
//       </div>
//     </main>
//   );
// };

const Welcome: NextPage = () => {
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>Welcome - DeltaHacks 9</title>
      </Head>
      <div className="drawer drawer-end relative h-full min-h-screen w-full overflow-x-hidden font-montserrat">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

        <div className="drawer-content">
          <Background />
          <NavBar />
          <Content />
          <footer className="flex justify-end pr-4 md:absolute md:bottom-0 md:right-0 md:block">
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
              <li>Your application has not been received.</li>
              {/* <!-- Sidebar content here --> */}
              {/* <li>
                <a className="mx-2 my-2 text-base font-bold" href="#">
                  Dashboard
                </a>
              </li>
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
                  className="font-sub rounded bg-[#4F14EE] py-2.5 px-2.5 text-sm font-bold"
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

  const userEntry = await prisma.user.findFirst({
    where: { id: session.user.id },
  });

  if (
    userEntry &&
    (userEntry.typeform_response_id === null ||
      userEntry.typeform_response_id === undefined)
  ) {
    return { props: {} };
  }
  return { redirect: { destination: "/dashboard", permanent: false } };
};

export default Welcome;
