import type { GetServerSidePropsContext, NextPage } from "next";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";
import Head from "next/head";
import { Prisma, Role, Status } from "@prisma/client";
import { trpc } from "../../utils/trpc";
import { ApplicationsTable } from "../../components/ApplicationsTable";
import Drawer from "../../components/Drawer";
import { useState } from "react";

import MultiRangeSlider from "../../components/MultiRangeSlider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/DropdownMenu";
import { Button } from "../../components/Button";
import { ChevronDown } from "lucide-react";

const GradingPortal: NextPage = () => {
  const { data: applications } = trpc.reviewer.getApplications.useQuery();
  const { data: statusCount } = trpc.application.getStatusCount.useQuery();

  const numberGrades =
    applications?.reduce((acc, application) => {
      return acc + application.reviewCount;
    }, 0) ?? 0;

  const numberDecisioned = statusCount?.reduce((acc, val) => {
    return val.status != Status.IN_REVIEW ? acc + val.count : acc;
  }, 0);

  const [startRange, setStartRange] = useState(0);
  const [endRange, setEndRange] = useState(17);
  const statusTypes = [
    Status.ACCEPTED,
    Status.REJECTED,
    Status.WAITLISTED,
    Status.IN_REVIEW,
  ];
  const [selectedStatus, setSelectedStatus] = useState<
    (typeof statusTypes)[number] | null
  >(null);

  // based on the ranges, find all applications that fall avgScore within the range
  const filteredApplications = applications?.filter((application) => {
    return (
      application.avgScore >= startRange && application.avgScore <= endRange
    );
  });

  const utils = trpc.useUtils();

  const {
    mutate: updateApplicationStatusByScoreRange,
    isPending,
    isSuccess,
  } = trpc.reviewer.updateApplicationStatusByScoreRange.useMutation({
    onSettled(data, error, variables, context) {
      utils.invalidate();
    },
  });

  return (
    <>
      <Head>
        <title>Grading Portal</title>
      </Head>
      <Drawer
        pageTabs={[
          { pageName: "Dashboard", link: "/dashboard" },
          { pageName: "Review", link: "" },
          { pageName: "Schedule", link: "/schedule" },
        ]}
      >
        <main className="px-14 py-16">
          <h1 className="text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl">
            Applications
          </h1>
          <div className="flex justify-between">
            <div className="py-4">
              <div className="font-bold">
                Applications Decisioned: {numberDecisioned} /{" "}
                {applications?.length} <br />
              </div>
              <div className="font-bold">
                Total Grades Given: {numberGrades}
                <br />
              </div>
              {statusCount?.map(({ status, count }, i) => {
                return (
                  <div key={i}>
                    {status}: {count} <br />
                  </div>
                );
              })}
            </div>
            <div>
              <h2>Mass Status Updator</h2>
              <div className="w-64 mt-4">
                <MultiRangeSlider
                  min={0}
                  max={17}
                  onChange={(min, max) => {
                    setStartRange(min);
                    setEndRange(max);
                  }}
                />
                <div>
                  Selected Range: {startRange.toFixed(1)} -{" "}
                  {endRange.toFixed(1)}
                </div>
                This applies to {filteredApplications?.length} applications
                <div className="flex flex-col gap-2 mt-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className="justify-between w-36"
                        variant="outline"
                      >
                        <span className="sr-only">Select status</span>
                        <div>{selectedStatus || "Select Status"}</div>
                        <ChevronDown className="pl-2 h-4 w-6 float-right" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {statusTypes.map((status) => (
                        <DropdownMenuItem
                          key={status}
                          className="capitalize"
                          onClick={() => setSelectedStatus(status)}
                        >
                          {status}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    onClick={() => {
                      console.log(
                        `Applying status ${selectedStatus} to applications between ${startRange} and ${endRange}`,
                      );
                      if (selectedStatus) {
                        updateApplicationStatusByScoreRange({
                          minRange: startRange,
                          maxRange: endRange,
                          status: selectedStatus,
                        });
                      }
                    }}
                    disabled={!selectedStatus || isPending}
                  >
                    {isPending ? "Applying..." : "Apply Status Change"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <ApplicationsTable applications={applications ?? []} />
        </main>
      </Drawer>
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
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
