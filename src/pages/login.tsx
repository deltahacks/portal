import type { GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { useRouter } from "next/router";
import DHBranding from "../components/DHBranding";
import LoginCard from "../components/LoginCard";
import ThemeToggle from "../components/ThemeToggle";
import { useEffect, useState } from "react";

const errorMsgs = [
  {
    name: "OAuthAccountNotLinked",
    msg: "To confirm your identity, sign in with the same account you used originally.",
  },
];

const Login: NextPage = () => {
  const router = useRouter();

  let isError = false;
  let errorMsg = undefined;
  if (router.query.error != undefined) {
    isError = true;
    errorMsg =
      errorMsgs.find((e) => e.name === router.query.error)?.msg ||
      "Error logging in. If this error persists, please contact us at tech@deltahacks.com for help.";
  }

  const [isWebview, setIsWebview] = useState(false);

  useEffect(() => {
    const navigator = window.navigator;
    const userAgent = navigator.userAgent;
    const normalizedUserAgent = userAgent.toLowerCase();
    const isAndroid = /android/.test(normalizedUserAgent);
    const isWebview = isAndroid && /; wv\)/.test(normalizedUserAgent);
    setIsWebview(isWebview);
  }, []);

  return (
    <>
      <Head>
        <title>Login - DeltaHacks X</title>
      </Head>

      <div className={`flex h-full w-full bg-[#f2f2f2] dark:bg-[#1f1f1f]`}>
        <div className="relative h-full w-full overflow-hidden bg-white dark:bg-[#171717] md:w-1/2">
          <div className="light-gradient dark:dark-gradient absolute inset-0 -left-[50%] -top-[50%] h-[200%] w-[200%] -rotate-12 animate-slow-bg"></div>
          <div className="absolute bottom-0 z-10 p-3 md:relative md:left-1/2 md:top-1/2 md:w-fit md:-translate-x-1/2 md:-translate-y-1/2">
            <DHBranding />
          </div>
        </div>
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        {isWebview && (
          <div className="z-30">
            <div className="toast toast-top toast-center">
              <div className="alert alert-warning">
                <span>
                  Webview detected.<br></br> Open this page in your browser.
                  <a
                    className="pl-2 underline"
                    href="/webview_fix.webp"
                    target="_blank"
                  >
                    Help
                  </a>
                </span>
              </div>
            </div>
          </div>
        )}

        <LoginCard errorMsg={isError ? errorMsg : undefined} />
      </div>
    </>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);
  if (session?.user) {
    return { redirect: { destination: "/welcome", permanent: false } };
  }
  return { props: {} };
};

export default Login;
