import type {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextPage,
} from "next";
import React from "react";
import Drawer from "../components/Drawer";
import Scheduler from "../components/Scheduler";

const Schedule: NextPage = () => {
  const startDate = new Date(2026, 0, 9);
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
            intervalCount={3}
          />
        </div>
        <div className="hidden h-full p-8 sm:block">
          <Scheduler
            defaultView="day"
            startDate={startDate}
            intervalCount={3}
          />
        </div>
      </div>
    </Drawer>
  );
};

export default Schedule;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const output: GetServerSidePropsResult<Record<string, unknown>> = {
    props: {},
  };

  ctx.res.setHeader("Netlify-Vary", "cookie=next-auth.session-token");
  ctx.res.setHeader("Cache-Control", "public, max-age=7200");

  return output;
}
