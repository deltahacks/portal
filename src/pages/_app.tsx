// src/pages/_app.tsx
import { SessionProvider } from "next-auth/react";
import type { AppType } from "next/app";
import type { Session } from "next-auth";
import "../styles/globals.css";
import Head from "next/head";
import Script from "next/script";
import { ThemeProvider } from "next-themes";
import { trpc } from "../utils/trpc";
import { env } from "../env/client.mjs";

const MyApp: AppType<{ session: Session | null; ogImage: string }> = ({
  Component,
  pageProps: { session, ogImage, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
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
          <meta property="og:image" content={env.NEXT_PUBLIC_URL + "/og.png"} />

          {/* <!-- HTML Meta Tags --> */}
          <title>DeltaHacks X</title>
          <meta name="description" content="Hackathon for Change" />

          <meta property="og:url" content="https://portal.deltahacks.com" />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="DeltaHacks X" />
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
          <meta name="twitter:title" content="DeltaHacks X" />
          <meta name="twitter:description" content="Hackathon for Change" />
          <meta
            name="twitter:image"
            content="https://beta.portal.deltahacks.com/og.png"
          />
        </Head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-419VDPBPXK"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-419VDPBPXK');
          `}
        </Script>
        <Component {...pageProps} />
      </ThemeProvider>
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
