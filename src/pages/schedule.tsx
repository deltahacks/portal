import type { GetServerSidePropsContext, NextPage } from "next";

// Schedule UI is temporarily disabled. To restore it, uncomment the imports and
// component below, then replace the redirect in getServerSideProps with props.
/*
import React from "react";
import Drawer from "../components/Drawer";
import Scheduler from "../components/Scheduler";

const Schedule: NextPage = () => {
  const startDate = new Date(2027, 0, 9);
  return (
    <Drawer
      pageTabs={[
        { pageName: "Dashboard", link: "/dashboard" },
        { pageName: "Schedule", link: "/schedule" },
      ]}
    >
      <div className="flex-auto overflow-hidden">
        <div className="h-full px-4 pt-5 sm:hidden">
          <Scheduler
            defaultView="agenda"
            startDate={startDate}
            intervalCount={2}
          />
        </div>
        <div className="hidden h-full p-8 sm:block">
          <Scheduler
            defaultView="day"
            startDate={startDate}
            intervalCount={2}
          />
        </div>
      </div>
    </Drawer>
  );
};
*/

const Schedule: NextPage = () => null;

export default Schedule;

/*
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const output: GetServerSidePropsResult<Record<string, unknown>> = {
    props: {},
  };

  ctx.res.setHeader("Netlify-Vary", "cookie=next-auth.session-token");
  ctx.res.setHeader("Cache-Control", "public, max-age=7200");

  return output;
}
*/

// Temporary schedule shutdown. Restore the handler above to re-enable it.
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  ctx.res.setHeader("Netlify-Vary", "cookie=next-auth.session-token");

  return { redirect: { destination: "/dashboard", permanent: false } };
}
