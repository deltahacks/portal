import type { GetServerSidePropsContext, NextPage } from "next";
import { getSession, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import Background from "../components/Background";
import NavBar from "../components/NavBar";
import SocialButtons from "../components/SocialButtons";
import ThemeToggle from "../components/ThemeToggle";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { trpc } from "../utils/trpc";
import { prisma } from "../server/db/client";

const Accepted: React.FC = () => {
  const { data: session } = useSession();
  return (
    <div>
      <h1 className="text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl">
        Hey {session ? `${session.user?.name}` : ""}, we can't wait to see you
        at Deltahacks 9!
      </h1>
      <h2 className="pt-6 text-xl font-normal dark:text-[#737373] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        We are pleased to announce that you have been invited to attend
        DeltaHacks 9! Come hack for change and build something incredible with
        hundreds of other hackers from January 13 - 15, 2023! To confirm that
        you will be attending, please RSVP:
      </h2>
      <div className="pt-6 text-xl font-normal dark:text-[#737373] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        If you have any questions, you can <br />
        reach us at{" "}
        <a href="mailto: hello@deltahacks.com" className="text-sky-400">
          hello@deltahacks.com
        </a>
      </div>
      <div className="flex flex-col gap-4 pt-6 sm:flex-row md:gap-8">
        <Link href="https://deltahacks.com/#faq">
          <button className="btn btn-primary w-48 border-none text-base font-medium capitalize">
            RSVP
          </button>
        </Link>
        <Link href="https://deltahacks.com/#faq">
          <button className="btn btn-primary w-48 border-none bg-zinc-700 text-base font-medium capitalize hover:bg-zinc-800">
            FAQ
          </button>
        </Link>
      </div>
    </div>
  );
};

const Rejected: React.FC = () => {
  const { data: session } = useSession();
  return (
    <div>
      <h1 className="text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl">
        Hey {session ? `${session.user?.name}` : ""}, thank you for submitting
        your application to DeltaHacks 9.
      </h1>
      <h2 className="pt-6 text-xl font-normal dark:text-[#737373] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        We had a lot of amazing applicants this year and were happy to see so
        many talented, enthusiastic individuals. Unfortunately, we can’t accept
        everyone and are unable to offer you a spot at the hackathon at this
        time. We really hope you’ll apply again next year!
      </h2>
      <div className="pt-6 text-xl font-normal dark:text-[#737373] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        If you have any questions, you can <br />
        reach us at{" "}
        <a href="mailto: hello@deltahacks.com" className="text-sky-400">
          hello@deltahacks.com
        </a>
      </div>
      <div className="pt-6">
        <Link href="https://deltahacks.com/#faq">
          <button className="btn btn-primary w-48 border-none bg-zinc-700 text-base font-medium capitalize hover:bg-zinc-800">
            FAQ
          </button>
        </Link>
      </div>
    </div>
  );
};

const Waitlisted: React.FC = () => {
  const { data: session } = useSession();
  return (
    <div>
      <h1 className="text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl">
        Hey {session ? `${session.user?.name}` : ""}, thank you for your
        application to participate in our hackathon!
      </h1>
      <h2 className="pt-6 text-xl font-normal dark:text-[#737373] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        Due to the high volume of submissions we have received, we are unable to
        offer you a spot at this time. However, we have placed you on the
        waitlist and will be in touch if a spot becomes available. We encourage
        you to continue checking your email and our website for updates. Thank
        you for your interest in our event!
      </h2>
      <div className="pt-6 text-xl font-normal dark:text-[#737373] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        If you have any questions, you can <br />
        reach us at{" "}
        <a href="mailto: hello@deltahacks.com" className="text-sky-400">
          hello@deltahacks.com
        </a>
      </div>
      <div className="pt-6">
        <Link href="https://deltahacks.com/#faq">
          <button className="btn btn-primary w-48 border-none bg-zinc-700 text-base font-medium capitalize hover:bg-zinc-800">
            FAQ
          </button>
        </Link>
      </div>
    </div>
  );
};

const InReview: React.FC = () => {
  const { data: session } = useSession();
  return (
    <div>
      <h1 className="text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl">
        Thanks for applying{session ? `, ${session.user?.name}` : ""}!
      </h1>
      <h2 className="pt-6 text-xl font-normal dark:text-[#737373] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        We have recieved your application. You will hear back from us on your
        email. While you wait for DeltaHacks, lookout for other prep events by
        DeltaHacks on our social accounts.
      </h2>
      <div className="pt-6 text-xl font-normal dark:text-[#737373] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        If you have any questions, you can <br />
        reach us at{" "}
        <a href="mailto: hello@deltahacks.com" className="text-sky-400">
          hello@deltahacks.com
        </a>
      </div>
      <div className="pt-6">
        <Link href="https://deltahacks.com/#faq">
          <button className="btn btn-primary w-48 border-none bg-zinc-700 text-base font-medium capitalize hover:bg-zinc-800">
            FAQ
          </button>
        </Link>
      </div>
    </div>
  );
};

const RSVPed: React.FC = () => {
  const { data: session } = useSession();
  return (
    <div>
      <h1 className="text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl">
        Hey {session ? `${session.user?.name}` : ""}, looking forward to seeing
        you at the hackathon!
      </h1>
      <h2 className="pt-6 text-xl font-normal dark:text-[#737373] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        We are pleased to inform you that your registration for DeltaHacks 9 has
        been confirmed. Please look for an Attendee Package in your email with
        important information about the event in the coming days. Registration
        will take place at 5pm at{" "}
        <a
          className="text-sky-400 hover:underline"
          href="https://www.google.com/maps/place/Peter+George+Centre+for+Living+and+Learning/@43.2654,-79.9208391,17z/data=!3m1!4b1!4m5!3m4!1s0x882c9b6596106407:0xf256463687b966a8!8m2!3d43.2654!4d-79.9182642?coh=164777&entry=tt&shorturl=1"
        >
          Peter George Centre for Living and Learning building at McMaster
          University{" "}
        </a>
        from January 13-15. We look forward to seeing you there!
      </h2>
      <div className="pt-6 text-xl font-normal dark:text-[#737373] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        If you have any questions, you can <br />
        reach us at{" "}
        <a href="mailto: hello@deltahacks.com" className="text-sky-400">
          hello@deltahacks.com
        </a>
      </div>
      <div className="pt-6">
        <Link href="https://deltahacks.com/#faq">
          <button className="btn btn-primary w-48 border-none bg-zinc-700 text-base font-medium capitalize hover:bg-zinc-800">
            FAQ
          </button>
        </Link>
      </div>
    </div>
  );
};

const Dashboard: NextPage = () => {
  const {} = trpc.useQuery(["application.received"]);

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
          <main className="px-7 py-16 sm:px-14 md:w-10/12 lg:pl-20 2xl:w-8/12 2xl:pt-20">
            <Accepted />
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
    return { redirect: { destination: "/welcome", permanent: false } };
  }

  return { props: {} };
};

export default Dashboard;
