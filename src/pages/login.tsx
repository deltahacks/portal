import type { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import Head from "next/head";
import { useState, useEffect } from "react";
import { getServerAuthSession } from "../server/common/get-server-auth-session";

import DHBranding from "../components/DHBranding";
import LoginCard from "../components/LoginCard";

const Login: NextPage = () => {
  const [dark, setDark] = useState<boolean>();

  useEffect(() => {
    const currentTheme = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setDark(currentTheme);
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (event) => {
        const colorScheme = event.matches ? true : false;
        setDark(colorScheme);
      });
  }, []);

  return (
    <>
      <Head>
        <title>Login - DeltaHacks 9</title>
      </Head>
      <div
        className={`flex bg-[#1f1f1f] ${dark && "dark"} h-full w-full`}
        data-theme={dark ? "dark" : "light"}
      >
        <div className="relative h-full w-full overflow-hidden bg-[#171717] md:w-1/2">
          <div
            className="absolute inset-0 -top-[50%] -left-[50%] h-[200%] w-[200%] -rotate-12 animate-slow-bg"
            style={{
              maskImage: "url(images/bg.png)",
              WebkitMaskImage: "url(images/bg.png)",
              background:
                "linear-gradient(#1C1C1C 0%, #1C1C1C 40%, #2e2e2e 50%, #1C1C1C 60%, #1C1C1C 100%)",
              backgroundSize: "200% 200%",
            }}
          ></div>
          <div className="absolute bottom-0 z-10 p-3 md:relative md:top-1/2 md:left-1/2 md:w-fit md:-translate-x-1/2 md:-translate-y-1/2">
            <DHBranding />
          </div>
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
