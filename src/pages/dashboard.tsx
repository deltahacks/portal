import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
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
import { Status } from "@prisma/client";
import React, { useRef } from "react";
import { useRouter } from "next/router";
import { Button } from "../components/Button";

interface TimeUntilStartInterface {
  hms: [h: number, m: number, s: number];
}

const TimeUntilStart: React.FC<TimeUntilStartInterface> = ({ hms }) => {
  const [[hrs, mins, secs], setTime] = React.useState(hms);

  const tick = () => {
    if (hrs === 0 && mins === 0 && secs === 0) reset();
    else if (mins === 0 && secs === 0) {
      setTime([hrs - 1, 59, 59]);
    } else if (secs === 0) {
      setTime([hrs, mins - 1, 59]);
    } else {
      setTime([hrs, mins, secs - 1]);
    }
  };

  const reset = () => setTime([0, 0, 0]);

  React.useEffect(() => {
    const timerId = setInterval(() => tick(), 1000);
    return () => clearInterval(timerId);
  });

  return (
    <div>
      <p>{`${hrs.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`}</p>
    </div>
  );
};

const Accepted: React.FC = () => {
  const { data: session } = useSession();
  const utils = trpc.useUtils();
  const doRsvp = trpc.application.rsvp.useMutation({
    onSuccess: async () => {
      await utils.application.status.invalidate();
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl">
        Hey {session ? session.user?.name : ""}, we can{"'"}t wait to see you at
        Deltahacks X!
      </h1>
      <h2 className="pt-6 text-xl font-normal dark:text-[#c1c1c1] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        We are pleased to announce that you have been invited to attend
        DeltaHacks X! Come hack for change and build something incredible with
        hundreds of other hackers from January 12 - 14, 2023! To confirm that
        you will be attending, please RSVP below.
      </h2>
      {/* <h2 className="pt-6 text-xl font-normal dark:text-[#c1c1c1] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        Sorry, RSVPs are now closed. Thank you so much for your interest in
        DeltaHacks and we hope to see you next year!
      </h2> */}
      <div className="pt-6 text-xl font-normal dark:text-[#c1c1c1] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        If you have any questions, you can <br />
        reach us at{" "}
        <a href="mailto: hello@deltahacks.com" className="text-sky-400">
          hello@deltahacks.com
        </a>
      </div>
      <div className="t-6 flex flex-col md:flex-row flex-wrap gap-6 pb-24 pt-6">
        <Button
          onClick={async () => {
            await doRsvp.mutateAsync();
          }}
          className="w-full md:w-48 bg-primary dark:bg-primary dark:text-white"
        >
          RSVP
        </Button>
        <Button>
          <Link className="w-full md:w-48" href="https://deltahacks.com/#FAQ">
            FAQ
          </Link>
        </Button>

        {/* <Button>
          <Link className="w-full md:w-48" href="/schedule">
            Schedule
          </Link>
        </Button> */}
      </div>
      {/* <div className="flex flex-col gap-4 pt-6 sm:flex-row md:gap-8">
        <button
          className="btn btn-primary w-48 border-none text-base font-medium capitalize"
          onClick={async () => {
            await doRsvp.mutateAsync();

            // await utils.invalidateQueries(["application.status"]);
          }}
        >
          RSVP
        </button>

        <Link href="https://deltahacks.com/#FAQ">
          <button className="btn btn-primary w-48 border-none bg-zinc-700 text-base font-medium capitalize hover:bg-zinc-800">
            FAQ
          </button>
        </Link>
      </div> */}
    </div>
  );
};

const Rejected: React.FC = () => {
  const { data: session } = useSession();
  return (
    <div>
      <h1 className="text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl">
        Hey {session ? `${session.user?.name}` : ""}, thank you for submitting
        your application to DeltaHacks X.
      </h1>
      <h2 className="pt-6 text-xl font-normal dark:text-[#c1c1c1] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        We had a lot of amazing applicants this year and were happy to see so
        many talented, enthusiastic individuals. Unfortunately, we can’t accept
        everyone and are unable to offer you a spot at the hackathon at this
        time. We really hope you’ll apply again next year!
      </h2>
      <div className="pt-6 text-xl font-normal dark:text-[#c1c1c1] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        If you have any questions, you can <br />
        reach us at{" "}
        <a href="mailto: hello@deltahacks.com" className="text-sky-400">
          hello@deltahacks.com
        </a>
      </div>
      <div className="pt-6">
        <Link href="https://deltahacks.com/#FAQ">
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
      <h2 className="pt-6 text-xl font-normal dark:text-[#c1c1c1] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        Due to the high volume of submissions we have received, we are unable to
        offer you a spot at this time. However, we have placed you on the
        <b> waitlist</b> and will be in touch if a spot becomes available. We
        encourage you to continue checking your email and our website for
        updates. Thank you for your interest in our event!
      </h2>
      <div className="pt-6 text-xl font-normal dark:text-[#c1c1c1] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        If you have any questions, you can <br />
        reach us at{" "}
        <a href="mailto: hello@deltahacks.com" className="text-sky-400">
          hello@deltahacks.com
        </a>
      </div>
      <div className="pt-6">
        <Link href="https://deltahacks.com/#FAQ">
          <button className="btn btn-primary w-48 border-none bg-zinc-700 text-base font-medium capitalize hover:bg-zinc-800">
            FAQ
          </button>
        </Link>
      </div>
    </div>
  );
};

type InReviewProps = {
  killed: boolean;
};

const InReview: React.FC<InReviewProps> = ({ killed }) => {
  const { data: session } = useSession();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const router = useRouter();
  // call deleteApplication endpoint
  const deleteApplication = trpc.application.deleteApplication.useMutation({
    onSuccess: () => {
      router.push("/apply");
    },
  });
  return (
    <div>
      <h1 className="text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl">
        Thanks for applying{session ? `, ${session.user?.name}` : ""}!
      </h1>
      <h2 className="pt-6 text-xl font-normal dark:text-[#c1c1c1] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        We have recieved your application. You will hear back from us on your
        email. While you wait for DeltaHacks, lookout for other prep events by
        DeltaHacks on our social accounts.
      </h2>
      <h1>{killed}</h1>

      <div className="pt-6 text-xl font-normal dark:text-[#c1c1c1] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        If you have any questions, you can <br />
        reach us at{" "}
        <a href="mailto: hello@deltahacks.com" className="text-sky-400">
          hello@deltahacks.com
        </a>
      </div>
      {!killed ? (
        <div className="flex gap-5 pt-6">
          <button
            className="btn btn-primary dark:text-white w-48 border-none  text-base font-medium capitalize"
            onClick={() => dialogRef.current?.showModal()}
          >
            Redo Application
          </button>

          <dialog
            className="modal modal-bottom sm:modal-middle"
            ref={dialogRef}
          >
            <div className="modal-box">
              <h3 className="text-lg font-bold">Are you sure ?</h3>
              <p className="py-4">
                You will lose all and have to start from scratch.
              </p>
              <div className="modal-action">
                <form method="dialog">
                  {/* if there is a button in form, it will close the modal */}
                  <div className="flex gap-5">
                    <button
                      className="btn btn-outline btn-error"
                      onClick={() => deleteApplication.mutateAsync()}
                    >
                      Proceed
                    </button>
                    <button className="btn btn-primary dark:text-white border-none bg-zinc-700 text-base font-medium capitalize hover:bg-zinc-800">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </dialog>
          <Link href="https://deltahacks./#FAQ">
            <button className="btn btn-primary dark:text-white w-48 border-none bg-zinc-700 text-base font-medium capitalize hover:bg-zinc-800">
              FAQ
            </button>
          </Link>
        </div>
      ) : (
        <div className="mt-5">
          <Link href="https://deltahacks.com/#FAQ">
            <button className="btn btn-primary w-48 border-none bg-zinc-700 text-base font-medium capitalize hover:bg-zinc-800">
              FAQ
            </button>
          </Link>
        </div>
      )}
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
      <h2 className="pt-6 text-xl font-normal dark:text-[#c1c1c1] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        We are pleased to inform you that your registration for DeltaHacks X has
        been confirmed. Please look for an Attendee Package in your email with
        important information about the event in the coming days. Registration
        will take place at{" "}
        <a
          className="text-sky-400 hover:underline"
          href="https://www.google.com/maps/place/Peter+George+Centre+for+Living+and+Learning/@43.2654,-79.9208391,17z/data=!3m1!4b1!4m5!3m4!1s0x882c9b6596106407:0xf256463687b966a8!8m2!3d43.2654!4d-79.9182642?coh=164777&entry=tt&shorturl=1"
        >
          Peter George Centre for Living and Learning building at McMaster
          University{" "}
        </a>
        <span className="font-bold">
          (Reminder: Friday is NOT in-person and will be taking place on
          Discord).
        </span>{" "}
        Please regularly check your email for updates and more information. We
        look forward to seeing you there!
      </h2>
      <div className="pt-6 text-xl font-normal dark:text-[#c1c1c1] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        If you have any questions, you can <br />
        reach us at{" "}
        <a href="mailto: hello@deltahacks.com" className="text-sky-400">
          hello@deltahacks.com
        </a>
      </div>
      <div className="t-6 flex flex-col md:flex-row flex-wrap gap-6 pb-24 pt-6">
        <Button>
          <Link className="w-full md:w-48" href="https://deltahacks.com/#FAQ">
            FAQ
          </Link>
        </Button>
        <Button>
          <Link
            className="w-full md:w-48"
            href="https://discord.gg/22ddpvfwXn"
            target="_blank"
          >
            Discord
          </Link>
        </Button>
        {/* <Button>
          <Link className="w-full md:w-48" href="/schedule">
            Schedule
          </Link>
        </Button> */}
      </div>
    </div>
  );
};

const CheckedIn: React.FC = () => {
  const { data: qrcode, isLoading } = trpc.application.qr.useQuery();
  const { data: session } = useSession();
  const hoursMinSecs = [1, 30, 20];

  return (
    <div>
      <h1 className="text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl">
        Hey {session ? `${session.user?.name}` : ""}, welcome to your dashboard!
      </h1>
      <p>More information will be here as we get closer to the hackathon.</p>
      {/* <h2 className="pt-6 text-xl font-normal dark:text-[#c1c1c1] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        Here is where you can access your profile, which will contain a backup
        of your QR code, as well as the event schedule. You can scan the QR code
        of other attendees to get their profile information through the scanner
        button.
      </h2>
      <div className="flex w-full flex-col gap-4 pt-6 sm:w-1/2 sm:flex-row md:gap-8">
        <Link href="/me">
          <div className="btn btn-primary w-full border-none text-base font-medium capitalize sm:w-1/2">
            My Profile{" "}
          </div>
        </Link>
        <Link href="/scanner">
          <div className="btn btn-primary w-full border-none text-base font-medium capitalize sm:w-1/2">
            Scanner
          </div>
        </Link>
        <Link href="/schedule">
          <div className="btn btn-primary w-full border-none bg-zinc-700 text-base font-medium capitalize hover:bg-zinc-800 sm:w-1/2">
            Schedule
          </div>
        </Link>
      </div>
      <div className="flex w-full flex-col gap-4 pb-24 pt-6 sm:w-1/2 sm:flex-row md:gap-8">
        <Link href="https://deltahacks.com/#FAQ">
          <button className="btn btn-primary w-full border-none bg-zinc-700 text-base font-medium capitalize hover:bg-zinc-800 sm:w-1/2">
            FAQ
          </button>
        </Link>
        <Link
          href="https://drive.google.com/file/d/1r4oLL37piVo_1xrJt34SA95pLaeaU9do/view?usp=sharing"
          target="_blank"
          rel="noreferrer"
        >
          <button className="btn btn-primary w-full border-none bg-zinc-700 text-base font-medium capitalize hover:bg-zinc-800 sm:w-1/2">
            Attendee Package
          </button>
        </Link>
        <Link
          href="https://discord.gg/KpEdu3J5"
          target="_blank"
          rel="noreferrer"
        >
          <button className="btn btn-primary w-full border-none bg-zinc-700 text-base font-medium capitalize hover:bg-zinc-800 sm:w-1/2">
            Discord
          </button>
        </Link>
      </div> */}
    </div>
  );
};

const WalkIns: React.FC = () => {
  const { data: qrcode, isLoading } = trpc.application.qr.useQuery();
  const { data: session } = useSession();
  const hoursMinSecs = [1, 30, 20];

  return (
    <div>
      <h1 className="text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl">
        Hey {session ? `${session.user?.name}` : ""}, thanks for filling out
        your application!
      </h1>
      <h2 className="pt-6 text-xl font-normal dark:text-[#c1c1c1] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        You are almost done! To finish registration go to the check-in page, and
        link your QR code. Happy hacking!
      </h2>
      <div className="flex flex-wrap  gap-6 pt-6 ">
        <Link href="https://deltahacks.com/#FAQ">
          <button className="btn btn-primary w-48 border-none bg-zinc-700 text-base font-medium capitalize hover:bg-zinc-800">
            FAQ
          </button>
        </Link>
        <Link href="/checkin">
          <button className="btn btn-primary w-48 border-none text-base font-medium capitalize">
            Check-in{" "}
          </button>
        </Link>
      </div>
    </div>
  );
};

const Dashboard: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = (props) => {
  const { data: status, isSuccess } = trpc.application.status.useQuery();

  const { data: session } = useSession();

  const stateMap = {
    [Status.IN_REVIEW]: <InReview killed={props.killed || false} />,
    [Status.ACCEPTED]: <Accepted />,
    [Status.WAITLISTED]: <Waitlisted />,
    [Status.REJECTED]: <Rejected />,
    [Status.RSVP]: <RSVPed />,
    [Status.CHECKED_IN]: <CheckedIn />,
  };

  const statusToUse = isSuccess ? status : props.status;

  return (
    <>
      <Head>
        <title>Dashboard - DeltaHacks X</title>
      </Head>
      <Background />
      <div className="drawer drawer-end relative h-full min-h-screen w-full overflow-x-hidden font-montserrat">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <NavBar />
          <main className="px-7 py-16 sm:px-14 md:w-10/12 lg:pl-20 2xl:w-8/12 2xl:pt-20">
            {stateMap[statusToUse]}
          </main>
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
                  className="font-sub rounded bg-primary px-2.5 py-2.5 text-sm font-bold text-white"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        <footer className=" bottom-0 right-0 p-5 md:absolute md:bottom-0">
          <SocialButtons />
        </footer>
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
    include: { dh10application: true },
  });
  const killedStr = await prisma.config.findFirst({
    where: { name: "killApplications" },
    select: { value: true },
  });

  // they are killed in all cases unless the value is "false"
  let killed = true;

  if (killedStr && JSON.parse(killedStr.value) === false) {
    killed = false;
  }

  // If submitted then do nothing
  if (userEntry && userEntry.dh10application !== null) {
    return {
      props: {
        status: userEntry.status,
        killed: killed,
      },
    };
  }

  return {
    redirect: { destination: "/welcome", permanent: false },
  };
};

export default Dashboard;
