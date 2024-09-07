import type { GetServerSidePropsContext, NextPage } from "next";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import Head from "next/head";
import { Role, Status } from "@prisma/client";
import { trpc } from "../utils/trpc";
import { ApplicationsTable } from "../components/ApplicationsTable";
import Drawer from "../components/Drawer";

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
      <Drawer
        pageTabs={[
          { pageName: "Dashboard", link: "/dashboard" },
          { pageName: "Review", link: "" },
        ]}
      >
        <main className="px-14 py-16">
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
      </Drawer>
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
