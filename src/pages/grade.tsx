import { useState } from "react";
import type { GetServerSidePropsContext, NextPage } from "next";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import Head from "next/head";
import Link from "next/link";
import { Role, Status } from "@prisma/client";
import Background from "../components/Background";
import GradingNavBar from "../components/GradingNavBar";
import ThemeToggle from "../components/ThemeToggle";
import { trpc } from "../utils/trpc";
import { ApplicationsTable } from "../components/ApplicationsTable";

const GradingPortal: NextPage = () => {
  const { data: applications } = trpc.reviewer.getApplications.useQuery();
  const { data: statusCount } = trpc.application.getStatusCount.useQuery();

  const numberReviewed = statusCount?.reduce((acc, val) => {
    return val.status != Status.IN_REVIEW ? acc + val.count : acc;
  }, 0);

  return (
    <>
      <Head>
        <title>Grading Portal</title>
      </Head>
      <Background />
      <div className="drawer drawer-end relative h-full min-h-screen w-full overflow-x-hidden font-montserrat">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <GradingNavBar />

          <main className="mx-auto px-14 py-16">
            <h1 className="text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl">
              Applications
            </h1>
            <div className="py-4">
              <div className="font-bold">
                Applications Reviewed: {numberReviewed} / {applications?.length}{" "}
                <br />
              </div>
              {statusCount?.map((value, i) => {
                const { status, count } = value;
                return (
                  <>
                    {status}: {count} <br />
                  </>
                );
              })}
            </div>
            <ApplicationsTable applications={applications ?? []} />
          </main>
        </div>
        <div className="drawer-side md:hidden">
          <label
            htmlFor="my-drawer-3"
            className="drawer-overlay md:hidden"
          ></label>
          <div className="menu h-full w-80 flex-row content-between overflow-y-auto bg-white p-4 dark:bg-[#1F1F1F] md:hidden">
            <ul className="w-full">
              <li>
                <Link className="text-base font-bold" href="/dashboard">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link className="text-base font-bold" href="">
                  Review
                </Link>
              </li>
            </ul>
            <div className="mx-1 mb-2 flex w-full items-center justify-between">
              <ThemeToggle />
              <div>
                <button className="font-sub rounded bg-primary px-2.5 py-2.5 text-sm font-bold text-white">
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

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);
  // If the user is not an ADMIN or REVIEWER, kick them back to the dashboard
  if (
    !(
      session?.user?.role?.includes(Role.ADMIN) ||
      session?.user?.role?.includes(Role.REVIEWER)
    )
  ) {
    return {
      redirect: { destination: "/dashboard", permanent: false },
    };
  }

  // Otherwise, continue.
  return { props: {} };
};

export default GradingPortal;
