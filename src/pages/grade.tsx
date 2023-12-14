import { useState } from "react";
import type { GetServerSidePropsContext, NextPage } from "next";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import Head from "next/head";
import Link from "next/link";
import { Role } from "@prisma/client";
import Background from "../components/Background";
import GradingNavBar from "../components/GradingNavBar";
import ThemeToggle from "../components/ThemeToggle";
import Applicant from "../components/Applicant";
import { trpc } from "../utils/trpc";
import { hasRequiredRoles } from "../utils/assertions";
import { Application } from "../server/router/reviewers";

const GradingPortal: NextPage = () => {
  const [togglePriority, setTogglePriority] = useState(true);

  const { data, isLoading } = trpc.reviewer.getApplications.useQuery();

  const { data: rsvpCount } = trpc.application.rsvpCount.useQuery();

  return (
    <>
      <Head>
        <title>Grading Portal</title>
      </Head>
      <div className="drawer drawer-end relative h-full min-h-screen w-full overflow-x-hidden font-montserrat">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <GradingNavBar />
          <Background />

          <main className="mx-auto px-14 py-16">
            <div className="flex justify-between">
              <h1 className="text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl">
                Applications
              </h1>
              <div className="text-right">
                <button
                  className="btn btn-primary"
                  onClick={() => setTogglePriority(!togglePriority)}
                >
                  {togglePriority ? "Showing Priority" : "Showing All"}
                </button>
                <div className="py-4">
                  / {data?.length} Applications Reviewed <br />
                  {rsvpCount} RSVPs
                </div>
              </div>
            </div>
            <table className="my-8 w-full text-left">
              <thead className=" bg-black text-white">
                <tr>
                  <th className="border-2 border-slate-800 p-3">Index</th>
                  <th className="border-2 border-slate-800 p-3">Email</th>
                  <th className="border-2 border-slate-800 p-3">Name</th>
                  <th className="border-2 border-slate-800 p-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {!isLoading &&
                  data?.map((application: Application, index: number) => (
                    <Applicant
                      key={application.id}
                      applicant={application}
                      index={index + 1}
                    />
                  ))}
              </tbody>
            </table>
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
  if (!hasRequiredRoles(session?.user?.role, [Role.ADMIN, Role.REVIEWER])) {
    return {
      redirect: { destination: "/dashboard", permanent: false },
    };
  }

  // Otherwise, continue.
  return { props: {} };
};

export default GradingPortal;
