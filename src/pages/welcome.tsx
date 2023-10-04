import type { NextPage, GetServerSidePropsContext } from "next";
import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import Background from "../components/Background";
import { Drawer } from "../components/NavBar";
import SocialButtons from "../components/SocialButtons";
import ThemeToggle from "../components/ThemeToggle";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { prisma } from "../server/db/client";

const Content = () => {
  return (
    <main className="px-7 py-8 sm:px-14 md:w-10/12 md:py-16 lg:pl-20 2xl:w-8/12 2xl:pt-20">
      <div className="text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-4xl 2xl:text-4xl">
        A weekend worth hacking,
        <br />@ DeltaHacks 10
      </div>
      <div className="pt-6 text-xl font-normal dark:text-[#737373] sm:text-2xl lg:pt-8 lg:text-2xl lg:leading-tight 2xl:pt-10 2xl:text-2xl">
        At DeltaHacks, we believe change comes from dreaming big. Each year we
        enable over 800 students from across North America, working hard over 36
        hours, to bring their big ideas to life. Unleash your creativity and
        make something great, we{"'"}ll handle the rest! Make big ideas a
        reality at DeltaHacks 10!
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
        <Link href="https://deltahacks.com/#faq">
          <button className="btn btn-primary w-48 border-none bg-zinc-700 text-base font-medium capitalize hover:bg-zinc-800">
            FAQ
          </button>
        </Link>
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
  return (
    <>
      <Head>
        <title>Welcome - DeltaHacks 10</title>
      </Head>
      <Drawer>
        <Content />
        <footer className="flex justify-end pr-4 md:absolute md:bottom-0 md:right-0 md:block">
          <SocialButtons />
        </footer>
      </Drawer>
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
