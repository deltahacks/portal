import type { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";
import logo from "../../public/images/logo.png";
import google_icon from "../../public/images/google_icon.svg";
import window_logo from "../../public/images/window_logo.svg";
import github_logo from "../../public/images/github_logo.svg";
import discord_logo from "../../public/images/discord_logo.svg";
import { signIn } from "next-auth/react";
import { getServerAuthSession } from "../server/common/get-server-auth-session";

export const DHBranding = () => {
    return (
        <div className="text-white">
            <h1 className="whitespace-nowrap font-montserrat text-4xl font-bold md:text-6xl">
                Delta<span className="mr-2 font-normal">Hacks</span>IX
            </h1>
            <h2 className="font-montserrat text-sm md:text-xl">
                January 13-15 | McMaster University
            </h2>
        </div>
    );
};

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
                <title>DH9 Login Page</title>
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="#181818" // add light/dark mode
                />
                <link rel="icon" href="/favicon.ico" />
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
                        <div className="flex items-center gap-4">
                            <div className="hidden aspect-square w-20 md:block md:w-40">
                                <Image
                                    src={logo}
                                    alt="DeltaHacks logo"
                                    layout="responsive"
                                ></Image>
                            </div>
                            <DHBranding />
                        </div>
                    </div>
                </div>
                <div className=" absolute top-1/2 left-1/2 min-w-[85%] -translate-x-1/2 -translate-y-1/2 md:left-3/4 md:min-w-[40vw] ">
                    <h2 className="mb-4 text-2xl font-bold text-black dark:text-white">
                        Log In
                    </h2>
                    <div className="flex flex-col gap-1 rounded-xl border border-zinc-600 bg-zinc-800 p-4 text-white">
                        <button
                            className="align-items-center flex h-32 items-center justify-center rounded-lg bg-[#4F14EE] py-6 text-center text-xl font-medium"
                            onClick={() => signIn("google")}
                        >
                            <div className="mr-4 aspect-square w-8">
                                <Image
                                    src={google_icon}
                                    alt="Google Login Icon"
                                    layout="responsive"
                                ></Image>
                            </div>
                            <div className="whitespace-nowrap md:text-lg">
                                Sign in with Google
                            </div>
                        </button>
                        <div className="my-2 flex items-center justify-center text-center text-sm text-zinc-600">
                            <span className="h-0.5 w-full bg-zinc-600" />
                            <div className="mx-2 whitespace-nowrap">
                                Or Continue With
                            </div>
                            <span className="h-0.5 w-full bg-zinc-600" />
                        </div>
                        <button
                            className="text-l flex items-center justify-center rounded-md border border-zinc-700 py-2 text-center font-medium hover:bg-zinc-700"
                            onClick={() => signIn("github")}
                        >
                            <div className="mr-2 aspect-square  w-4">
                                <Image
                                    src={github_logo}
                                    alt="Github Icon"
                                    layout="responsive"
                                ></Image>
                            </div>
                            GitHub
                        </button>
                        {/* <button className="text-l my-1 flex items-center justify-center rounded-md border border-zinc-700 py-2 text-center font-medium hover:bg-zinc-700" 
            onClick={() => {}}>
              <div className="mr-2 aspect-square  w-4">
                <Image
                  src={window_logo}
                  alt="Window Icon"
                  layout="responsive"
                ></Image>
              </div>
              Outlook
            </button> */}
                        <button
                            className="text-l flex items-center justify-center rounded-md border border-zinc-700 py-2 text-center font-medium hover:bg-zinc-700"
                            onClick={() => signIn("discord")}
                        >
                            <div className="mr-2 aspect-square  w-4">
                                <Image
                                    src={discord_logo}
                                    alt="Discord Icon"
                                    layout="responsive"
                                ></Image>
                            </div>
                            Discord
                        </button>
                    </div>
                </div>
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
