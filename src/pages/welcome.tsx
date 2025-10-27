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
    <main className="flex min-h-screen flex-col justify-center px-8 py-12 sm:px-16 md:w-11/12 md:py-20 lg:w-10/12 lg:px-24 xl:w-9/12 2xl:w-8/12 2xl:px-28">
      <div className="space-y-8 lg:space-y-10 2xl:space-y-12">
        {/* Hero Section */}
        <section>
          <h1 className="text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl lg:text-5xl 2xl:text-6xl">
            A weekend worth hacking,
            <br />
            <span className="text-primary">@ Deltahacks 12</span>
          </h1>
        </section>

        {/* Description Section */}
        <section className="max-w-4xl">
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 sm:text-xl lg:text-2xl 2xl:text-3xl">
            At DeltaHacks, we believe change comes from dreaming big. Each year we
            enable over 800 students from across North America, working hard over 24
            hours, to bring their big ideas to life. Unleash your creativity and
            make something great, we{"'"}ll handle the rest! Make big ideas a
            reality at Deltahacks 12!
          </p>
        </section>

        {/* Contact Section */}
        <section className="max-w-3xl">
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 sm:text-xl lg:text-2xl 2xl:text-3xl">
            If you have any questions, you can reach us at{" "}
            <a
              href="mailto:tech@deltahacks.com"
              className="font-medium text-sky-500 transition-colors hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300"
            >
              tech@deltahacks.com
            </a>
          </p>
        </section>

        {/* CTA Buttons */}
        <section className="flex flex-col gap-4 pt-4 sm:flex-row sm:gap-6">
          <Button
            asChild
            className="btn btn-primary w-full border-none bg-primary text-base font-semibold capitalize text-white transition-colors hover:bg-[#7380ff] dark:bg-primary dark:hover:bg-[#646EE5] sm:w-52"
          >
            <Link href="/apply">Apply</Link>
          </Button>
          <Button
            asChild
            className="btn w-full border-none bg-gray-200 text-base font-semibold capitalize text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 sm:w-52"
          >
            <Link href="https://deltahacks.com/#faq">FAQ</Link>
          </Button>
        </section>
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
        <title>Welcome - Deltahacks 12</title>
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
    include: { DH12Application: true },
  });

  // If submitted then go to dashboard
  if (userEntry && userEntry.DH12Application !== null) {
    return { redirect: { destination: "/dashboard", permanent: false } };
  }

  return { props: {} };
};

export default Welcome;
