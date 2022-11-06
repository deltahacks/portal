import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import GradingBackground from "../components/GradingBackground";
import GradingNavBar from "../components/GradingNavBar";
import ThemeToggle from "../components/ThemeToggle";

const GradingPortal: NextPage = () => {
    return (
        <>
            <Head>
                <title>Grading Portal</title>
            </Head>
            <div className="drawer drawer-end relative h-full min-h-screen w-full overflow-x-hidden font-montserrat">
                <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content">
                    <GradingNavBar />
                    <GradingBackground />

                </div>
                <div className="drawer-side md:hidden">
                    <label
                        htmlFor="my-drawer-3"
                        className="drawer-overlay md:hidden"
                    ></label>
                    <div className="menu h-full w-80 flex-row content-between overflow-y-auto bg-white p-4 dark:bg-[#1F1F1F] md:hidden">
                        <ul className="w-full">
                            <li>
                                <Link
                                    className="text-base font-bold"
                                    href="/dashboard"
                                >
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link
                                    className="text-base font-bold"
                                    href=""
                                >
                                    Review
                                </Link>
                            </li>
                        </ul>
                        <div className="mx-1 mb-2 flex w-full items-center justify-between">
                            <ThemeToggle />
                            <div>
                                <button
                                    className="font-sub rounded bg-primary py-2.5 px-2.5 text-sm font-bold text-white"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GradingPortal;
