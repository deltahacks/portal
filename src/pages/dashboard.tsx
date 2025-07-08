import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import SocialButtons from "../components/SocialButtons";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { trpc } from "../utils/trpc";
import { prisma } from "../server/db/client";
import { Status } from "@prisma/client";
import React, { useRef } from "react";
import { useRouter } from "next/router";
import { Button } from "../components/Button";
import Drawer from "../components/Drawer";
import { Checkbox } from "../components/Checkbox";

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

  const [shareResume, setShareResume] = React.useState(false);
  const rsvpDialogRef = useRef<HTMLDialogElement | null>(null);

  return (
    <div>
      <h1 className="text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl">
        Hey{" "}
        <span className="capitalize">{session ? session.user?.name : ""}</span>,
        we can{"'"}t wait to see you at DeltaHacks XI!
      </h1>
      <h2 className="pt-6 text-xl font-normal dark:text-[#c1c1c1] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        We are pleased to announce that you have been invited to attend
        DeltaHacks XI! Come hack for change and build something incredible with
        hundreds of other hackers on January 11 - 12, 2025! To confirm that you
        will be attending, please RSVP below.
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
        {/* When the user clicks this button, open the modal to ask about sharing resume */}
        <Button
          onClick={() => {
            rsvpDialogRef.current?.showModal();
          }}
          className="btn btn-primary bg-primary dark:bg-primary hover:hover:bg-[#7380ff] dark:hover:bg-[#646EE5] dark:text-white w-48 border-none text-base font-medium capitalize"
        >
          RSVP
        </Button>
        <Button className="btn w-48 border-none hover: hover:bg-zinc-700 text-base font-medium capitalize">
          <Link className="w-full md:w-48" href="https://deltahacks.com/#FAQ">
            FAQ
          </Link>
        </Button>
      </div>

      {/* RSVP Modal to confirm sharing resume */}
      <dialog
        className="modal modal-bottom sm:modal-middle"
        ref={rsvpDialogRef}
      >
        <div className="modal-box dark:bg-[#1F1F1F]">
          <h3 className="text-lg font-bold dark:text-white">
            Complete Your RSVP
          </h3>
          <p className="py-4">
            Would you like to share your resume with our sponsors?
          </p>
          <div className="flex items-center gap-4 py-4">
            <Checkbox
              id="shareResume"
              checked={shareResume}
              onCheckedChange={(checked) => setShareResume(!!checked)}
              className="w-6 h-6"
            />
            <label
              htmlFor="shareResume"
              className=" font-normal dark:text-white  lg:leading-tight"
            >
              Share my resume with sponsors
            </label>
          </div>
          <div className="modal-action">
            <form method="dialog">
              <div className="flex gap-5">
                <button
                  className="btn btn-primary dark:bg-primary dark:text-white border-none text-base font-medium capitalize"
                  onClick={async () => {
                    await doRsvp.mutateAsync({ rsvpCheck: shareResume });
                    rsvpDialogRef.current?.close();
                  }}
                >
                  Confirm
                </button>
                <button
                  className="btn bg-zinc-700 dark:text-white border-none text-base font-medium capitalize hover:bg-zinc-800"
                  onClick={() => rsvpDialogRef.current?.close()}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </dialog>

      {/* <Button>
          <Link className="w-full md:w-48" href="/schedule">
            Schedule
          </Link>
        </Button> */}
      {/* </div> */}
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
        Hey{" "}
        <span className="capitalize">
          {session ? `${session.user?.name}` : ""}
        </span>
        , thank you for submitting your application to DeltaHacks XI.
      </h1>
      <h2 className="pt-6 text-xl font-normal dark:text-[#c1c1c1] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        We had a lot of amazing applicants this year and were happy to see so
        many talented, enthusiastic individuals. Unfortunately we were not able
        to accommodate all applicants this year and are unable to offer you a
        spot at the hackathon at this time. We really hope you&apos;ll apply
        again next year!
      </h2>
      <div className="pt-6 text-xl font-normal dark:text-[#c1c1c1] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        If you have any questions, you can <br />
        reach us at{" "}
        <a href="mailto: hello@deltahacks.com" className="text-sky-400">
          hello@deltahacks.com
        </a>
      </div>
      <div className="pt-6">
        <Button className="btn w-48 border-none hover: hover:bg-zinc-700 text-base font-medium capitalize">
          <Link className="w-full md:w-48" href="https://deltahacks.com/#FAQ">
            FAQ
          </Link>
        </Button>
      </div>
    </div>
  );
};

const Waitlisted: React.FC = () => {
  const { data: session } = useSession();
  return (
    <div>
      <h1 className="text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl">
        Hey{" "}
        <span className="capitalize">
          {session ? `${session.user?.name}` : ""}
        </span>
        , thank you for your application to participate in our hackathon!
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
        <Button className="btn w-48 border-none hover: hover:bg-zinc-700 text-base font-medium capitalize">
          <Link className="w-full md:w-48" href="https://deltahacks.com/#FAQ">
            FAQ
          </Link>
        </Button>
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
        Thanks for applying
        {session ? (
          <span className="capitalize">, {session.user?.name}</span>
        ) : (
          ""
        )}
        !
      </h1>
      <h2 className="pt-6 text-xl font-normal dark:text-[#c1c1c1] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        We have received your application. You will hear back from us on your
        email. While you wait for DeltaHacks, look out for other prep events by
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
          {/* <Button
            onClick={() => dialogRef.current?.showModal()}
            className="btn btn-primary bg-primary dark:bg-primary hover:hover:bg-[#7380ff] dark:hover:bg-[#646EE5] dark:text-white w-48 border-none  text-base font-medium capitalize"
          >
            Redo Application
          </Button> */}

          <dialog
            className="modal modal-bottom sm:modal-middle  "
            ref={dialogRef}
          >
            <div className="modal-box dark:bg-[#1F1F1F]">
              <h3 className="text-lg font-bold dark:text-white">
                Are you sure?
              </h3>
              <p className="py-4">
                By proceeding, you are withdrawing your application from
                DeltaHacks and must apply again to be considered for the event.
              </p>
              <div className="modal-action">
                <form method="dialog">
                  {/* if there is a button in form, it will close the modal */}
                  <div className="flex gap-5">
                    <button
                      className="btn btn-error dark:text-white"
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
          <Button className="btn w-48 border-none hover: hover:bg-zinc-700 text-base font-medium capitalize">
            <Link className="w-full md:w-48" href="https://deltahacks.com/#FAQ">
              FAQ
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-5">
          <Button className="btn w-48 border-none hover: hover:bg-zinc-700 text-base font-medium capitalize">
            <Link className="w-full md:w-48" href="https://deltahacks.com/#FAQ">
              FAQ
            </Link>
          </Button>
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
        Hey{" "}
        <span className="capitalize">
          {session ? `${session.user?.name}` : ""}
        </span>
        , looking forward to seeing you at the hackathon!
      </h1>

      {/* <h2 className="pt-6 text-xl font-normal dark:text-[#c1c1c1] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        We are pleased to inform you that your registration for DeltaHacks XI
        has been confirmed. Please look for an Attendee Package in your email
        with important information about the event in the coming days.
        Registration will take place at{" "}
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
      </h2> */}
      <div className="pt-6 text-xl font-normal dark:text-[#c1c1c1] sm:text-2xl lg:pt-8 lg:text-3xl lg:leading-tight 2xl:pt-10 2xl:text-4xl">
        If you have any questions, you can reach us at{" "}
        <a href="mailto: hello@deltahacks.com" className="text-sky-400">
          hello@deltahacks.com
        </a>
      </div>
      <div className="t-6 flex flex-col md:flex-row flex-wrap gap-6 pb-24 pt-6">
        <Button className="btn rainbow-border border-4 rounded-sm w-full mb-4 md:w-48 hover:bg-zinc-700 text-base font-medium capitalize">
          <Link className="w-full md:w-48 " href="/profile">
            Check-In QR Code
          </Link>
        </Button>
        <Button className="btn w-full md:w-48 border-none hover: hover:bg-zinc-700 text-base font-medium capitalize">
          <Link className="w-full md:w-48" href="https://deltahacks.com/#FAQ">
            FAQ
          </Link>
        </Button>
        <Button className="btn w-full md:w-48 border-none hover: hover:bg-zinc-700 text-base font-medium capitalize">
          <Link
            className="w-full md:w-48"
            href="https://discord.gg/22ddpvfwXn"
            target="_blank"
          >
            Discord
          </Link>
        </Button>
        <Button className="btn w-full md:w-48 border-none hover: hover:bg-zinc-700 text-base font-medium capitalize">
          <Link className="w-full md:w-48" href="/schedule">
            Schedule
          </Link>
        </Button>
        <Button className="btn w-full md:w-48 border-none hover: hover:bg-zinc-700 text-base font-medium capitalize">
          <Link
            className="w-full md:w-48"
            href="https://drive.google.com/file/d/1MzRExOJT-OasMVAaDxbvb1kTNmFzJ28E/view?usp=sharing"
          >
            Attendee Package
          </Link>
        </Button>
      </div>
    </div>
  );
};

const CheckedIn: React.FC = () => {
  const { data: qrcode, isPending } = trpc.application.qr.useQuery();
  const { data: session } = useSession();
  const hoursMinSecs = [1, 30, 20];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl">
        Hey {session ? `${session.user?.name}` : ""}, welcome to your dashboard!
      </h1>
      <Link href="/schedule">
        <Button className="btn w-full border-none hover:bg-zinc-700 text-base font-medium capitalize">
          Schedule
        </Button>
      </Link>
      <Link href="/profile">
        <Button className="btn w-full border-none hover:bg-zinc-700 text-base font-medium capitalize">
          My Profile
        </Button>
      </Link>
      <Link
        href="https://drive.google.com/file/d/1MzRExOJT-OasMVAaDxbvb1kTNmFzJ28E/view?usp=sharing"
        target="_blank"
      >
        <Button className="btn w-full border-none hover:bg-zinc-700 text-base font-medium capitalize">
          Attendee Package
        </Button>
      </Link>
    </div>
  );
};

const WalkIns: React.FC = () => {
  const { data: qrcode, isPending } = trpc.application.qr.useQuery();
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
        <title>Dashboard - DeltaHacks XI</title>
      </Head>
      <Drawer
        pageTabs={[
          { pageName: "Dashboard", link: "/dashboard" },
          { pageName: "Schedule", link: "/schedule" },
        ]}
      >
        <main className="px-7 py-16 sm:px-14 md:w-10/12 lg:pl-20 2xl:w-8/12 2xl:pt-20">
          {stateMap[statusToUse]}
        </main>
        <footer className=" bottom-0 right-0 p-5 md:absolute md:bottom-0">
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
  if (userEntry && userEntry.DH11Application !== null) {
    return {
      props: {
        status: userEntry.DH11Application.status,
        killed: killed,
      },
    };
  }

  return {
    redirect: { destination: "/welcome", permanent: false },
  };
};

export default Dashboard;
