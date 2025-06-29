// src/pages/_app.tsx
import { SessionProvider, useSession } from "next-auth/react";
import type { AppType } from "next/app";
import type { Session } from "next-auth";
import "../styles/globals.css";
import Head from "next/head";

import { ThemeProvider } from "next-themes";
import { trpc } from "../utils/trpc";
import { env } from "../env/client.mjs";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";

if (typeof window !== "undefined") {
  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    ui_host: "https://app.posthog.com",
    loaded: (posthog) => {
      if (process.env.NODE_ENV === "development") posthog.debug();
    },
  });
}

const PosthogIdentifer = () => {
  const { data: session } = useSession();
  useEffect(() => {
    if (session && session.user) {
      posthog.identify(session.user.id, {
        email: session.user.email,
        name: session.user.name,
        avatar: session.user.image,
      });
    }
  }, [session]);
  return null;
};

const MyApp: AppType<{ session: Session | null; ogImage: string }> = ({
  Component,
  pageProps: { session, ogImage, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <PostHogProvider client={posthog}>
          <Head>
            <link rel="icon" type="image/svg+xml" href="/images/favicon.svg" />
            <link rel="icon" type="image/png" href="/images/favicon.png" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0, viewport-fit=cover"
            />
            <meta name="theme-color" content="#181818" />
            <meta
              name="apple-mobile-web-app-status-bar-style"
              content="#181818" // TODO: add light/dark mode
            />
            {/* open graph image */}
            {/* <meta
            property="og:image"
            content={env.NEXT_PUBLIC_URL + "/og.png"}
          /> */}

            {/* <!-- HTML Meta Tags --> */}
            <title>DeltaHacks XI</title>
            <meta name="description" content="Hackathon for Change" />

            <meta property="og:url" content="https://portal.deltahacks.com" />
            <meta property="og:type" content="website" />
            <meta property="og:title" content="DeltaHacks XI" />
            <meta property="og:description" content="Hackathon for Change" />
            <meta
              property="og:image"
              content="https://beta.portal.deltahacks.com/og.png"
            />

            <meta name="twitter:card" content="summary_large_image" />
            <meta
              property="twitter:domain"
              content="https://portal.deltahacks.com"
            />
            <meta
              property="twitter:url"
              content="https://portal.deltahacks.com"
            />
            <meta name="twitter:title" content="DeltaHacks XI" />
            <meta name="twitter:description" content="Hackathon for Change" />
            <meta
              name="twitter:image"
              content="https://beta.portal.deltahacks.com/og.png"
            />

            <meta name="theme-color" content="#6419E6" />
            <meta name="msapplication-navbutton-color" content="#6419E6" />
            <meta
              name="apple-mobile-web-app-status-bar-style"
              content="#6419E6"
            />
            {env.NEXT_PUBLIC_URL == "https://beta.portal.deltahacks.com" ? (
              <meta name="robots" content="noindex" />
            ) : null}
          </Head>
          <PosthogIdentifer />
          <Component {...pageProps} />
        </PostHogProvider>
      </ThemeProvider>
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
