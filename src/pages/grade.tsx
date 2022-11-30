import type { GetServerSidePropsContext, NextPage } from "next";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import Head from "next/head";
import Link from "next/link";
import Background from "../components/Background";
import GradingNavBar from "../components/GradingNavBar";
import ThemeToggle from "../components/ThemeToggle";
import Applicant from "../components/Applicant";
import { trpc } from "../utils/trpc";

interface IResponse {
  data: any;
  isLoading: boolean;
}

const GradingPortal: NextPage = () => {
  const { data, isLoading }: IResponse = trpc.useQuery([
    "reviewer.getApplications",
  ]);

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
          <main className="mx-auto px-7 py-16 sm:px-14 md:w-10/12 lg:pl-20 2xl:w-11/12 2xl:pt-20">
            <h1 className="text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl">
              Applications
            </h1>
            <table className="my-8 w-full text-left">
              <thead className="bg-black">
                <tr>
                  <th className="border-2 border-slate-800 p-3">First Name</th>
                  <th className="border-2 border-slate-800 p-3">Last Name</th>
                  <th className="border-2 border-slate-800 p-3">Judged By</th>
                  <th className="border-2 border-slate-800 p-3">Score</th>
                  <th className="border-2 border-slate-800 p-3">
                    Submit Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {!isLoading
                  ? data?.data.map((application: any) => (
                      <Applicant
                        key={application.response_id}
                        applicant={application}
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

export const getServerSideProps = async (
  context: any,
  cdx: GetServerSidePropsContext
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
