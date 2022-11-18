import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Background from "../components/Background";
import GradingNavBar from "../components/GradingNavBar";
import ThemeToggle from "../components/ThemeToggle";
import Applicant from "../components/Applicant";

import { trpc } from "../utils/trpc";
import type { NextPage } from "next";
import { useEffect } from 'react';


const GradingPortal: NextPage = () => {

  const { data, isLoading } = trpc.useQuery(["reviewer.getApplications"]);
  trpc.useQuery(["reviewer.getReviewed"]);
  // console.log(data, isLoading);

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
          <main className="px-7 py-16 sm:px-14 md:w-10/12 lg:pl-20 2xl:w-11/12 2xl:pt-20 mx-auto">
            <h1 className="text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl">
              Applications
            </h1>
            <table className="my-6 w-full text-left">
              <thead className="bg-black">
                <tr>
                  <th className="border border-slate-600 p-3">First Name</th>
                  <th className="border border-slate-600 p-3">Last Name</th>
                  <th className="border border-slate-600 p-3">Judged By</th>
                  <th className="border border-slate-600 p-3">Score</th>
                  <th className="border border-slate-600 p-3">Submit Score</th>
                  <th className="border border-slate-600 p-3">
                    View Applicant
                  </th>
                </tr>
              </thead>
              <tbody>
                {
                  data?.data.map((application) => {
                      return (
                        <Applicant key={application.response_id} applicant={application}/>
                      );
                  })
                }
              </tbody>
            </table>

            {/* <button className="font-sub rounded bg-primary py-2.5 px-2.5 text-sm font-bold text-white" onClick={() => fetchNextPage()}>
                Fetch More
            </button> */}
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
                <button className="font-sub rounded bg-primary py-2.5 px-2.5 text-sm font-bold text-white">
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
