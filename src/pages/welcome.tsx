import type { NextPage, GetServerSidePropsContext } from "next";
import Head from "next/head";
import Link from "next/link";
import Drawer from "../components/Drawer";
import SocialButtons from "../components/SocialButtons";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { prisma } from "../server/db/client";
import { Button } from "../components/Button";

const Content = () => {
  return (
    <main className="px-7 py-8 sm:px-14 md:w-10/12 md:py-16 lg:pl-20 2xl:w-8/12 2xl:pt-20">
      <div className="text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-4xl 2xl:text-4xl">
        A weekend worth hacking,
        <br />@ DeltaHacks XI
      </div>
      <div className="pt-6 text-xl font-normal dark:text-[#c1c1c1] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        At DeltaHacks, we believe change comes from dreaming big. Each year we
        enable over 800 students from across North America, working hard over 24
        hours, to bring their big ideas to life. Unleash your creativity and
        make something great, we{"'"}ll handle the rest! Make big ideas a
        reality at DeltaHacks XI!
      </div>
      <div className="pt-6 text-xl font-normal dark:text-[#c1c1c1] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        If you have any questions, you can <br />
        reach us at{" "}
        <a href="mailto: tech@deltahacks.com" className="text-sky-400">
          tech@deltahacks.com
        </a>
      </div>
      <div className="flex flex-col gap-3 pt-6 md:flex-row lg:pt-8 2xl:pt-10">
        <Button
          asChild
          className="btn btn-primary bg-primary dark:bg-primary hover:hover:bg-[#7380ff] dark:hover:bg-[#646EE5] dark:text-white w-48 border-none  text-base font-medium capitalize"
        >
          <Link href="/apply">
            {/* <button className="btn btn-primary w-48 text-base font-medium capitalize"> */}
            Apply
            {/* </button> */}
          </Link>
        </Button>
        <Button
          asChild
          className="btn w-48 border-none hover: hover:bg-zinc-700 text-base font-medium capitalize"
        >
          <Link href="https://deltahacks.com/#FAQ">FAQ</Link>
        </Button>
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
        <title>Welcome - DeltaHacks XI</title>
      </Head>
      <Drawer>
        <Content />
        <footer className="flex justify-end pb-4 pr-4 md:absolute md:bottom-0 md:right-0 md:block">
          <SocialButtons />
        </footer>
      </Drawer>
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
    include: { DH11Application: true },
  });

  // If submitted then go to dashboard
  if (userEntry && userEntry.DH11Application !== null) {
    return { redirect: { destination: "/dashboard", permanent: false } };
  }

  return { props: {} };
};

export default Welcome;
