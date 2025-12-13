import React from "react";
import Head from "next/head";
import Drawer from "../../../components/Drawer";
import { CSVUploader } from "../../../components/CSVUploader";
import { trpc } from "../../../utils/trpc";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { Role } from "@prisma/client";
import { rbac } from "../../../components/RBACWrapper";
import { getServerAuthSession } from "../../../server/common/get-server-auth-session";
import Link from "next/link";
import {
  DevpostCSVProcessor,
  DoraHacksCSVProcessor,
} from "../../../utils/csvProcessors";

const JudgingPage: React.FC = () => {
  const [startTime, setStartTime] = React.useState<string>(
    new Date().toISOString().slice(0, 16),
  );
  const [judgingDuration, setJudgingDuration] = React.useState<string>("");
  const [endTime, setEndTime] = React.useState<string>("");
  const [numTables, setNumTables] = React.useState<number | null>(null);
  const [projectsPerTable, setProjectsPerTable] = React.useState<number>(10);

  const createTables = trpc.project.createTables.useMutation({
    onSuccess: () => {
      createTimeSlots.mutate({
        startTime: new Date(startTime).toISOString(),
      });
    },
  });

  const createTimeSlots = trpc.timeSlot.createTimeSlots.useMutation({
    onSuccess: (data) => {
      if (data.endTime) {
        const start = new Date(startTime);
        const end = new Date(data.endTime);
        const durationMs = end.getTime() - start.getTime();
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor(
          (durationMs % (1000 * 60 * 60)) / (1000 * 60),
        );
        setJudgingDuration(`${hours} hours and ${minutes} minutes`);

        setEndTime(
          end.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
        );
      }
      if (data.numTables) {
        setNumTables(data.numTables);
      }
    },
  });

  return (
    <>
      <Head>
        <title>Judging Admin - DeltaHacks</title>
      </Head>
      <Drawer>
        <main className="px-7 py-16 sm:px-14 md:w-10/12 lg:pl-20 2xl:w-8/12 2xl:pt-20 mx-auto max-w-4xl">
          <h1 className="mb-12 text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl text-center">
            Judging Administration
          </h1>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mb-12">
            <Link href="/admin/judging/rubric" className="btn btn-accent">
              Manage Judging Rubric
            </Link>
            <Link
              href="/admin/judging/leaderboard"
              className="btn btn-secondary"
            >
              View Leaderboard
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* CSV Upload Section */}
            <section className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title justify-center mb-4">
                  Import Project Data
                </h2>
                <CSVUploader csvProcessor={new DevpostCSVProcessor()} />
              </div>
            </section>

            {/* Schedule Configuration Section */}
            <section className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title justify-center mb-4">
                  Schedule Configuration
                </h2>

                <div className="space-y-6">
                  {/* Time Configuration */}
                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="font-medium">Start Time</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="input input-bordered w-full"
                      />
                    </div>
                  </div>

                  {/* Table Configuration */}
                  <div className="form-control">
                    <label className="label">
                      <span className="font-medium">
                        Projects per Table: {projectsPerTable}
                      </span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="25"
                      value={projectsPerTable}
                      onChange={(e) =>
                        setProjectsPerTable(Number(e.target.value))
                      }
                      className="range range-primary"
                    />
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => createTables.mutate({ projectsPerTable })}
                    disabled={
                      createTables.isPending || createTimeSlots.isPending
                    }
                    className={`btn w-full ${
                      createTables.isPending || createTimeSlots.isPending
                        ? "bg-white" // Removed btn-disabled
                        : createTables.isSuccess && createTimeSlots.isSuccess
                          ? "btn-success"
                          : createTables.isError || createTimeSlots.isError
                            ? "btn-error"
                            : "btn-primary"
                    }`}
                    title={
                      createTables.error?.message ||
                      createTimeSlots.error?.message ||
                      ""
                    }
                  >
                    {createTables.isPending || createTimeSlots.isPending
                      ? "Creating Schedule..."
                      : createTables.isSuccess && createTimeSlots.isSuccess
                        ? "Schedule Created!"
                        : "Create Schedule"}
                  </button>
                  {/* Status Information */}
                  {(createTimeSlots.isSuccess ||
                    createTables.isPending ||
                    createTimeSlots.isPending) && (
                    <div className="mt-4 space-y-2 text-center">
                      {judgingDuration && (
                        <div className="text-base font-semibold">
                          Total Duration: {judgingDuration}
                        </div>
                      )}
                      {endTime && (
                        <div className="text-base font-semibold">
                          End Time: {endTime}
                        </div>
                      )}
                      {numTables && (
                        <div className="text-base font-semibold">
                          Number of Tables: {numTables}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </main>
      </Drawer>
    </>
  );
};

// Add server-side props function for access control
export async function getServerSideProps(context: GetServerSidePropsContext) {
  let output: GetServerSidePropsResult<Record<string, unknown>> = { props: {} };
  output = rbac(
    await getServerAuthSession(context),
    [Role.ADMIN],
    undefined,
    output,
  );
  return output;
}

export default JudgingPage;
