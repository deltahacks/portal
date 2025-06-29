import { useRouter } from "next/router";
import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
  NextPage,
} from "next";
import Head from "next/head";
import Drawer from "../../components/Drawer";
import SocialButtons from "../../components/SocialButtons";
import { trpc } from "../../utils/trpc";
import QRCode from "react-qr-code";
import { env } from "../../env/client.mjs";
import { useSession } from "next-auth/react";

import Image from "next/image";
import { z } from "zod";
import { useState } from "react";
import Select from "react-select";
import { useQuery } from "@tanstack/react-query";

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
    email: z.string().email(),
  }),
  organizer: z.object({
    email: z.string().email(),
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
  const canAct =
    session.data?.user?.role.includes(Role.GENERAL_SCANNER) ||
    session.data?.user?.role.includes(Role.ADMIN);
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

  const logEventMutation = trpc.events.checkin.useMutation({
    onSettled: () => {
      utils.user.getProfile.invalidate();
    },
  });

  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: () => getEvents(),
  });

  console.log(events, "EVENTS");

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
        <main className="px-7 sm:px-14 md:w-10/12 lg:pl-20 2xl:w-8/12 2xl:pt-8">
          <section>
            <h1 className="font-bold text-2xl dark:text-white mb-2">
              {user?.DH11Application?.firstName}{" "}
              {user?.DH11Application?.lastName}
            </h1>
            <div className="mb-4">
              {user?.DH11Application?.studyYearOfStudy}{" "}
              {user?.DH11Application?.studyDegree} <br />
              {user?.DH11Application?.studyMajor} <br />
              {user?.DH11Application?.studyLocation}
            </div>
            {!showCode ? (
              <>
                <h2 className="font-bold text-lg dark:text-white mb-2">
                  Socials
                </h2>
                <ul className="flex flex-col gap-2 mb-4">
                  {user?.DH11Application?.socialText.map((socialText, i) => {
                    return (
                      <li
                        key={i}
                        className="dark:text-black/90 text-white/90 bg-black dark:bg-white underline p-2 rounded-md"
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

          {showCode ? (
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <div className="w-full flex justify-center items-center bg-white rounded-lg p-4 shadow-lg shadow-black/50">
                <QRCode
                  value={`${env.NEXT_PUBLIC_URL}/profile/${qrCodeId}`}
                  className="w-full aspect-square h-auto"
                />
              </div>
              <div>
                <div className="flex  w-full gap-4  *:select-none ">
                  {/* <div className="flex-1 relative">
                    <Link className=" block aspect-[110/35] w-full" href="#">
                      <Image
                        src="/wallet/google-badge-en.svg"
                        alt="Add to Google Wallet"
                        fill
                        className="pointer-events-none"
                      />
                    </Link>
                  </div> */}
                  <div className="flex-1 relative">
                    <Link
                      className=" block aspect-[110/35] w-full"
                      href={`/api/wallet/apple/${qrCodeId}`}
                    >
                      <Image
                        src="/wallet/apple-badge-en.svg"
                        alt="Add to Apple Wallet"
                        fill
                        className="pointer-events-none"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {canAct && (
            <div className="my-4">
              <div>
                <label className="label">
                  <span>Event Check in :</span>
                </label>
                <Select
                  value={{
                    value: selectedEvent ?? "",
                    label: selectedEvent ?? "",
                  }}
                  options={
                    events?.map((event) => ({
                      value: event.summary,
                      label:
                        event.summary?.split("|")[0]?.trim() ?? event.summary,
                    })) ?? []
                  }
                  onChange={(option) => setSelectedEvent(option?.value ?? null)}
                  isLoading={false}
                  unstyled={true}
                  classNames={{
                    control: (state) =>
                      state.menuIsOpen
                        ? "rounded-md p-3 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 bg-white border"
                        : "rounded-md p-3 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 bg-white border",
                    menu: () =>
                      "dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 bg-white border -mt-1 rounded-b-lg overflow-hidden",
                    option: () =>
                      "p-2 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 bg-white hover:bg-neutral-100 dark:hover:bg-neutral-900",
                    valueContainer: () =>
                      "dark:text-neutral-500 text-neutral-700 gap-2",
                    singleValue: () => "dark:text-white text-black",
                  }}
                />
                <Button
                  className="w-full my-2"
                  onClick={() =>
                    selectedEvent &&
                    logEventMutation.mutate({
                      userId: qrCodeId,
                      eventName: selectedEvent,
                    })
                  }
                  disabled={!selectedEvent || logEventMutation.isSuccess}
                >
                  {logEventMutation.isPending ? (
                    <span className="animate-spin">⌛</span>
                  ) : logEventMutation.isSuccess ? (
                    "Checked In ✅"
                  ) : (
                    "Check In"
                  )}
                </Button>
              </div>

              <div className="mt-4">
                Hackathon Check In
                <Button
                  className="w-full my-2"
                  onClick={() => {
                    checkInMutation.mutate(qrCodeId);
                  }}
                  disabled={user?.DH11Application?.status === "CHECKED_IN"}
                >
                  {checkInMutation.isPending ? (
                    <span className="animate-spin">⌛</span>
                  ) : user?.DH11Application?.status === "CHECKED_IN" ? (
                    "Already Checked In"
                  ) : (
                    "Check In"
                  )}
                </Button>
              </div>
            </div>
          )}
        </main>
        <footer className="bottom-0 right-0 p-4 md:absolute md:bottom-0">
          {/* <SocialButtons /> */}
        </footer>
      </Drawer>
    </>
  );
};

export default ProfilePage;

import { GetServerSideProps } from "next";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "../../server/router";
import { createContext, createContextInner } from "../../server/router/context";
import { Role, User } from "@prisma/client";
import { Button } from "../../components/Button";
import Link from "next/link";
import { ArrowUpLeftIcon, ArrowUpRightIcon } from "lucide-react";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";
import clsx from "clsx";
import { Controller } from "react-hook-form";
import SuperJSON from "superjson";

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
