import type { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import Head from "next/head";
import { getServerAuthSession } from "../server/common/get-server-auth-session";

import DHBranding from "../components/DHBranding";
import LoginCard from "../components/LoginCard";
import ThemeToggle from "../components/ThemeToggle";
import { useTheme } from "next-themes";

const Login: NextPage = () => {
  return (
    <>
      <Head>
        <title>Login - DeltaHacks 9</title>
      </Head>
      <div className={`flex h-full w-full dark:bg-[#1f1f1f]`}>
        <div className="relative h-full w-full overflow-hidden bg-[#eeeeee] dark:bg-[#171717] md:w-1/2">
          <div className="light-gradient dark:dark-gradient absolute inset-0 -top-[50%] -left-[50%] h-[200%] w-[200%] -rotate-12 animate-slow-bg"></div>
          <div className="absolute bottom-0 z-10 p-3 md:relative md:top-1/2 md:left-1/2 md:w-fit md:-translate-x-1/2 md:-translate-y-1/2">
            <DHBranding />
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <LoginCard />
      </div>
    </>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);
  console.log(session);
  if (session?.user) {
    return { redirect: { destination: "/", permanent: false } };
  }
  return { props: {} };
};

export default Login;
