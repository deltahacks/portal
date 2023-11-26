import { useEffect, useState } from "react";
import type { GetServerSidePropsContext, NextPage } from "next";
import { Review } from "@prisma/client";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import Head from "next/head";
import Link from "next/link";
import Background from "../components/Background";
import GradingNavBar from "../components/GradingNavBar";
import ThemeToggle from "../components/ThemeToggle";
import Applicant from "../components/Applicant";
import { trpc } from "../utils/trpc";
import { TypeFormSubmission } from "../server/router/reviewers";

const getReviewedApplications = (applications: any) => {
  return applications.filter(
    (application: any) => application.reviewer.length >= 3
  );
};

const GradingPortal: NextPage = () => {
  const [togglePriotity, setTogglePriority] = useState(true);

  // const appQuery = trpc.reviewer.getApplications.useQuery(undefined, {
  //   enabled: !togglePriotity,
  // });

  // const data = appQuery.data;
  // const isLoading = appQuery.isLoading;

  const { data, isLoading } = trpc.reviewer.getApplications.useQuery();

  const { data: rsvpCount } = trpc.application.rsvpCount.useQuery();

  const [mean, setMean] = useState<number>(0);
  const [median, setMedian] = useState<number>(0);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    console.log(data);
    const scores: number[] =
      data?.data
        .map((application) => {
          return (
            application.reviewer.reduce((a: number, b: { mark: number }) => {
              return a + b.mark;
            }, 0) / application.reviewer.length
          );
        })
        .filter((score) => !Number.isNaN(score)) || [];
    const sum = scores.reduce(
      (a: number, b: number) => (!Number.isNaN(b) ? a + b : a),
      0
    );
    const avg = sum / scores.length || 0;
    setMean(avg);

    const mid = Math.floor(scores.length / 2);
    const nums: number[] = [...scores].sort((a, b) => a - b);

    const median: number =
      (scores.length % 2 !== 0
        ? nums[mid]
        : (nums[mid - 1]! + nums[mid]!) / 2) || 0;
    setMedian(median);
  }, [data, isLoading]);

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
              <div>
                <h1 className="text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl">
                  Applications
                </h1>
                <div className="py-2">
                  <p>Mean: {mean}</p>
                  <p>Median: {median}</p>
                </div>
              </div>
              <div className="text-right">
                <button
                  className="btn btn-primary"
                  onClick={() => setTogglePriority(!togglePriotity)}
                >
                  {togglePriotity ? "Showing Priority" : "Showing All"}
                </button>
                <div className="py-4">
                  {
                    // count how many applications have been reviewed
                    // an application is considered reviewed if it has 3 or more reviewers
                    data?.data.filter(
                      (application) => application.reviewer.length >= 3
                    ).length
                  }{" "}
                  / {data?.data.length} Applications Reviewed <br />
                  {rsvpCount} RSVPs
                </div>
              </div>
            </div>
            <table className="my-8 w-full text-left">
              <thead className=" bg-black text-white">
                <tr>
                  <th className="border-2 border-slate-800 p-3">Index</th>
                  <th className="border-2 border-slate-800 p-3">Email</th>
                  <th className="border-2 border-slate-800 p-3">First Name</th>
                  <th className="border-2 border-slate-800 p-3">Last Name</th>
                  <th className="border-2 border-slate-800 p-3">Judged By</th>
                  <th className="border-2 border-slate-800 p-3">Score</th>
                  <th className="border-2 border-slate-800 p-3">
                    Submit Score
                  </th>
                  {/* <th className="border-2 border-slate-800 p-3">Accepted</th> */}
                </tr>
              </thead>
              <tbody className="text-white">
                {!isLoading
                  ? data?.data.map((application, index: number) => (
                      <Applicant
                        key={application.id}
                        applicant={application}
                        index={index + 1}
                      />
                    ))
                  : null}
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
  if (
    !(
      session?.user?.role?.includes("ADMIN") ||
      session?.user?.role?.includes("REVIEWER")
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
