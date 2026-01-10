import { useRouter } from "next/router";
import { GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import Drawer from "../../components/Drawer";
import { trpc } from "../../utils/trpc";
import QRCode from "react-qr-code";
import { env } from "../../env/client.mjs";
import { useSession } from "next-auth/react";

import Image from "next/image";
import { appRouter } from "../../server/router";
import { createContextInner } from "../../server/router/context";
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";

interface ProfilePageProps {
  initialState: any; // FIX THIS
  sesssionUserId: string;
}

const ProfilePage: NextPage<ProfilePageProps> = (props) => {
  const router = useRouter();
  const id =
    typeof router.query.slug === "string"
      ? router.query.slug
      : typeof router.query.slug === "object"
        ? router.query.slug[0]
        : undefined;

  const session = useSession();
  const showCode = id === undefined || id === session.data?.user?.id;
  const { data: user } = trpc.user.getProfile.useQuery(id, {
    enabled: id !== undefined,

    initialData: props?.initialState,
  });
  const qrCodeId = id ?? session.data?.user?.id ?? props.sesssionUserId;

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
        <main className="px-7 sm:px-14 md:max-w-2xl lg:max-w-3xl mx-auto 2xl:pt-8">
          <section className="text-center">
            <h1 className="font-bold text-2xl dark:text-white mb-2">
              {user?.DH12Application?.firstName}{" "}
              {user?.DH12Application?.lastName}
            </h1>
            <div className="mb-4">
              {user?.DH12Application?.studyYearOfStudy}{" "}
              {user?.DH12Application?.studyDegree} <br />
              {user?.DH12Application?.studyMajor} <br />
              {user?.DH12Application?.studyLocation}
            </div>
            {!showCode &&
            (user?.DH12Application?.socialText?.filter((s) => s?.trim())
              .length ?? 0) > 0 ? (
              <>
                <h2 className="font-bold text-lg dark:text-white mb-2">
                  Socials
                </h2>
                <ul className="flex flex-col gap-2 mb-4 items-center">
                  {(user?.DH12Application?.socialText ?? [])
                    .filter((s) => s?.trim())
                    .map((socialText, i) => (
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
                    ))}
                </ul>
              </>
            ) : null}
          </section>

          {showCode ? (
            <div className="flex flex-col gap-4 w-full mx-auto">
              <div className="w-full flex justify-center items-center bg-white rounded-lg p-6 shadow-lg shadow-black/50">
                <QRCode
                  value={`${env.NEXT_PUBLIC_URL}/profile/${qrCodeId}`}
                  size={400}
                  className="w-full h-auto max-w-full"
                />
              </div>
              <div>
                <div className="flex  w-full gap-4  *:select-none ">
                  <div className="flex-1 relative">
                    <Link
                      className="block aspect-[110/35] w-full"
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
                  </div>
                </div>
              </div>
            </div>
          ) : null}
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
