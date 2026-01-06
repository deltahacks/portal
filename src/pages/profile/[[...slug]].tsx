import { useRouter } from "next/router";
import { GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import Drawer from "../../components/Drawer";
import { trpc } from "../../utils/trpc";
import QRCode from "react-qr-code";
import { env } from "../../env/client.mjs";
import { useSession } from "next-auth/react";

import Image from "next/image";
import { z } from "zod";
import { useState } from "react";
import Select from "react-select";
import { useQuery } from "@tanstack/react-query";
import { appRouter } from "../../server/router";
import { createContextInner } from "../../server/router/context";
import { Role } from "@prisma/client";
import { Button } from "../../components/Button";
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";

interface ProfilePageProps {
  initialState: any; // FIX THIS
  sesssionUserId: string;
}

const GoogleEventSchema = z.object({
  kind: z.literal("calendar#event"),
  id: z.string(),
  status: z.string(),
  htmlLink: z.string(),
  created: z.string(),
  updated: z.string(),
  summary: z.string(),
  location: z.string().optional(),
  creator: z.object({
    email: z.email(),
  }),
  organizer: z.object({
    email: z.email(),
    displayName: z.string(),
    self: z.boolean(),
  }),
  start: z.object({
    dateTime: z.string(),
    timeZone: z.string(),
  }),
  end: z.object({
    dateTime: z.string(),
    timeZone: z.string(),
  }),
  iCalUID: z.string(),
  sequence: z.number(),
  eventType: z.string(),
});

const GoogleEventsResponseSchema = z.object({
  items: z.array(GoogleEventSchema),
});

const getEvents = async () => {
  const GOOGLE_CALENDAR_URL =
    "https://www.googleapis.com/calendar/v3/calendars/";
  const CALENDAR_ID =
    "c_54f72353fe8b6d9a474ba47ea768e372311c2365c69030509cd80b650ffb883b@group.calendar.google.com";
  const PUBLIC_KEY = "AIzaSyBnNAISIUKe6xdhq1_rjor2rxoI3UlMY7k";

  const dataUrl = [
    GOOGLE_CALENDAR_URL,
    CALENDAR_ID,
    "/events?key=",
    PUBLIC_KEY,
  ].join("");

  const response = await fetch(dataUrl);
  const rawData = await response.json();

  // Validate the response
  const parsedData = GoogleEventsResponseSchema.parse(rawData);
  const events = parsedData.items;

  const eventsWithType = events.map((event) => ({
    ...event,
    eventType: event.summary.split("|").at(-1)?.trim() ?? event.summary,
  }));

  // Filter for only Event and Workshop types
  return eventsWithType.filter(
    (event) =>
      event.eventType.toLowerCase() === "event" ||
      event.eventType.toLowerCase() === "workshop",
  );
};

// Export the schema if you need to use it elsewhere
export type GoogleEvent = z.infer<typeof GoogleEventSchema>;

const ProfilePage: NextPage<ProfilePageProps> = (props) => {
  console.log("Props", props);
  const router = useRouter();

  console.log(router.query);

  const id =
    typeof router.query.slug === "string"
      ? router.query.slug
      : typeof router.query.slug === "object"
        ? router.query.slug[0]
        : undefined;

  const session = useSession();

  const showCode = id === undefined || id === session.data?.user?.id;

  // fetch details about this user

  console.log(props.initialState, "INITIAL STATE");

  const {
    data: user,
    isPending,
    isError,
    isSuccess,
  } = trpc.user.getProfile.useQuery(id, {
    enabled: id !== undefined,

    initialData: props?.initialState,
  });

  const utils = trpc.useUtils();
  const checkInMutation = trpc.user.checkIn.useMutation({
    onSettled: () => {
      utils.user.getProfile.invalidate();
    },
  });
  const userStatus = trpc;

  const qrCodeId = id ?? session.data?.user?.id ?? props.sesssionUserId;

  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  // TODO: update logic for new qr code system
  // const logEventMutation = trpc.events.checkin.useMutation({
  //   onSettled: () => {
  //     utils.user.getProfile.invalidate();
  //   },
  // });

  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: () => getEvents(),
  });

  console.log(events, "EVENTS");

  return (
    <>
      <Head>
        <title>Dashboard - Deltahacks 12</title>
      </Head>
      <Drawer
        pageTabs={[
          { pageName: "Dashboard", link: "/dashboard" },
          { pageName: "Schedule", link: "/schedule" },
        ]}
      >
        <main className="px-7 sm:px-14 md:px-8 lg:px-12 xl:px-16 2xl:px-20 md:py-8 lg:py-12">
          <div className="md:max-w-7xl md:mx-auto md:grid md:grid-cols-2 md:gap-8 lg:gap-12">
            {/* User Information Section */}
            <section className="md:pr-4 lg:pr-8">
              <h1 className="font-bold text-2xl dark:text-white mb-2 md:text-3xl lg:text-4xl md:mb-4">
                {user?.DH12Application?.firstName}{" "}
                {user?.DH12Application?.lastName}
              </h1>
              <div className="mb-4 md:text-lg md:mb-6 md:leading-relaxed">
                {user?.DH12Application?.studyYearOfStudy}{" "}
                {user?.DH12Application?.studyDegree} <br />
                {user?.DH12Application?.studyMajor} <br />
                {user?.DH12Application?.studyLocation}
              </div>
              {!showCode ? (
                <>
                  <h2 className="font-bold text-lg dark:text-white mb-2 md:text-2xl md:mb-4">
                    Socials
                  </h2>
                  <ul className="flex flex-col gap-2 mb-4 md:gap-3">
                    {user?.DH12Application?.socialText.map((socialText, i) => {
                      return (
                        <li
                          key={i}
                          className="dark:text-black/90 text-white/90 bg-black dark:bg-white underline p-2 rounded-md md:p-3 md:text-lg hover:opacity-80 transition-opacity"
                        >
                          <Link
                            href={socialText}
                            className="flex items-start gap-1"
                          >
                            {socialText.replace("https://", "")}{" "}
                            <ArrowUpRightIcon />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : null}
            </section>

            {/* QR Code Section */}
            {showCode ? (
              <div className="flex flex-col gap-2 w-full md:w-auto md:flex md:items-start md:justify-center">
                <div className="w-full flex justify-center items-center bg-white rounded-lg p-4 shadow-lg shadow-black/50 md:max-w-sm md:p-6 lg:p-8">
                  <QRCode
                    value={`${env.NEXT_PUBLIC_URL}/profile/${qrCodeId}`}
                    className="w-full aspect-square h-auto"
                  />
                </div>
                <div className="md:max-w-sm md:w-full">
                  <div className="flex  w-full gap-4  *:select-none ">
                    <div className="flex-1 relative">
                      <Link className=" block aspect-[110/35] w-full" href="#">
                        <Image
                          src="/wallet/google-badge-en.svg"
                          alt="Add to Google Wallet"
                          fill
                          className="pointer-events-none"
                        />
                      </Link>
                    </div>
                    <div className="flex-1 relative">
                      <Link
                        className="relative block aspect-[110/35] w-full"
                        href={`/api/wallet/apple/${qrCodeId}`}
                      >
                        <Image
                          src="/wallet/apple-badge-en.svg"
                          alt="Add to Apple Wallet"
                          fill
                          className="pointer-events-none"
                        />
                      </Link>
                      <Link
                        className="relative block aspect-[110/35] w-full"
                        href={`/api/wallet/google/${qrCodeId}`}
                      >
                        <Image
                          src="/wallet/google-badge-en.svg"
                          alt="Add to Google Wallet"
                          fill
                          className="pointer-events-none"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </main>
        <footer className="bottom-0 right-0 p-4 md:absolute md:bottom-0">
          {/* <SocialButtons /> */}
        </footer>
      </Drawer>
    </>
  );
};

export default ProfilePage;

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);

  if (!session || !session.user) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  const id =
    typeof ctx.params?.slug === "string"
      ? ctx.params.slug
      : typeof ctx.params?.slug === "object"
        ? ctx.params.slug[0]
        : undefined;

  // Create context and call the procedure directly
  const context = await createContextInner({ session });
  const caller = appRouter.createCaller(context);
  const data = await caller.user.getProfile(id);

  return {
    props: {
      initialState: data,
      sesssionUserId: session.user.id,
    },
  };
};
