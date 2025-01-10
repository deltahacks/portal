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
        <main className="px-7 py-16 sm:px-14 md:w-10/12 lg:pl-20 2xl:w-8/12 2xl:pt-20">
          <section>
            <h1 className="font-bold text-2xl text-white">
              {user?.DH11Application?.firstName}{" "}
              {user?.DH11Application?.lastName}
            </h1>
            <ul>
              {user?.DH11Application?.socialText.map((socialText, i) => {
                return (
                  <li key={i} className="text-white/90 p-2 underline">
                    <Link href={socialText}>
                      {socialText.replace("https://", "")}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* if they can act, show them action buttons to check-in */}
          {canAct && (
            <div>
              <Button
                onClick={() => {
                  alert("This was never implemented ABHAHAHAHAHHAHAHAHAHHAHA");
                  // trpc.user.checkIn.mutation(id);
                }}
              >
                Check In
              </Button>
            </div>
          )}

          {id === undefined || id === session.data?.user?.id ? (
            <div className="flex flex-col gap-4 w-full ">
              <div className="w-full flex justify-center items-center">
                <QRCode
                  value={`${env.NEXT_PUBLIC_URL}/profile/${session.data?.user?.id}`}
                  className="w-full"
                />
              </div>
              <div>
                <div className="flex h-24 w-full gap-4 px-8 *:select-none">
                  <div className="flex-1">
                    <Link
                      className="relative block aspect-[110/35] w-full"
                      href="#"
                    >
                      <Image
                        src="/wallet/google-badge-en.svg"
                        alt="Add to Google Wallet"
                        fill
                        className="pointer-events-none"
                      />
                    </Link>
                  </div>
                  <div className="flex-1">
                    <Link
                      className="relative block aspect-[110/35] w-full"
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
