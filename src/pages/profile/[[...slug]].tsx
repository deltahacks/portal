import { useRouter } from "next/router";
import { NextApiRequest, NextApiResponse, NextPage } from "next";
import Head from "next/head";
import Drawer from "../../components/Drawer";
import SocialButtons from "../../components/SocialButtons";
import { trpc } from "../../utils/trpc";
import QRCode from "react-qr-code";
import { env } from "../../env/client.mjs";
import { useSession } from "next-auth/react";

import Image from "next/image";

interface ProfilePageProps {
  initialState: any; // FIX THIS
}

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

  console.log(id);

  const session = useSession();
  const canAct = session.data?.user?.role.includes(Role.GENERAL_SCANNER);
  const showCode = id === undefined || id === session.data?.user?.id;

  // fetch details about this user

  console.log(props.initialState, "INITIAL STATE");

  const {
    data: user,
    isLoading,
    isError,
    isSuccess,
  } = trpc.user.getProfile.useQuery(id, {
    enabled: id !== undefined,

    initialData: props?.initialState,
  });

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
        <main className="px-7 py-8 sm:px-14 md:w-10/12 lg:pl-20 2xl:w-8/12 2xl:pt-20">
          <section>
            <h1 className="font-bold text-2xl dark:text-white ">
              {user?.DH11Application?.firstName}{" "}
              {user?.DH11Application?.lastName}
            </h1>
            <div className="mb-8">
              {user?.DH11Application?.studyYearOfStudy}{" "}
              {user?.DH11Application?.studyDegree} <br />
              {user?.DH11Application?.studyMajor} <br />
              {user?.DH11Application?.studyLocation}
            </div>
            {!showCode ? (
              <>
                <h2 className="font-bold text-lg dark:text-white">Socials</h2>
                <ul className="flex flex-col gap-2 mb-8">
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

          {/* if they can act, show them action buttons to check-in */}

          {showCode ? (
            <div className="flex flex-col gap-4 w-full md:w-auto ">
              <div className="w-full flex justify-center items-center bg-white rounded-lg p-4 shadow-lg shadow-black/50">
                <QRCode
                  value={`${env.NEXT_PUBLIC_URL}/profile/${session.data?.user?.id}`}
                  className="w-full aspect-square h-auto"
                />
              </div>
              <div>
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
                      className=" block aspect-[110/35] w-full"
                      href={`/api/wallet/apple/${id}`}
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
            <div className="my-8">
              Scanner Actions
              <Button
                className="w-full my-2"
                onClick={() => {
                  alert("This was never implemented ABHAHAHAHAHHAHAHAHAHHAHA");
                  // trpc.user.checkIn.mutation(id);
                }}
              >
                Check In
              </Button>
            </div>
          )}
        </main>
        <footer className=" bottom-0 right-0 p-5 md:absolute md:bottom-0">
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
import { createContext } from "../../server/router/context";
import { Role, User } from "@prisma/client";
import { Button } from "../../components/Button";
import Link from "next/link";
import { ArrowUpLeftIcon, ArrowUpRightIcon } from "lucide-react";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id =
    typeof ctx.params?.slug === "string"
      ? ctx.params.slug
      : typeof ctx.params?.slug === "object"
      ? ctx.params.slug[0]
      : undefined;

  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: await createContext({
      req: ctx.req as NextApiRequest,
      res: ctx.res as NextApiResponse,
    }),
  });

  const data = await helpers.user.getProfile.fetch(id);

  return {
    props: {
      initialState: data,
    },
  };
};
