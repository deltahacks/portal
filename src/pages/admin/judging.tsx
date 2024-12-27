import React from "react";
import Head from "next/head";
import Drawer from "../../components/Drawer";
import { CSVUploader } from "../../components/CSVUploader";
import { trpc } from "../../utils/trpc";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { Role } from "@prisma/client";
import { rbac } from "../../components/RBACWrapper";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";

const JudgingPage: React.FC = () => {
  const [status, setStatus] = React.useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [projectsPerTable, setProjectsPerTable] = React.useState<number>(10);
  const [startTime, setStartTime] = React.useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [durationMinutes, setDurationMinutes] = React.useState(15);
  const [judgingDuration, setJudgingDuration] = React.useState<string>("");
  const [endTime, setEndTime] = React.useState<string>("");
  const [numTables, setNumTables] = React.useState<number | null>(null);

  const createTables = trpc.project.createTables.useMutation({
    onSuccess: () => {
      createTimeSlots.mutate({
        slotDurationMinutes: durationMinutes,
        startTime: new Date(startTime).toISOString(),
      });
    },
    onError: (error) => {
      setStatus("error");
      setErrorMessage(error.message);
      setTimeout(() => setStatus("idle"), 3000);
    },
  });

  const createTimeSlots = trpc.timeSlot.createTimeSlots.useMutation({
    onSuccess: (data) => {
      setStatus("success");
      if (data.endTime) {
        const start = new Date(startTime);
        const end = new Date(data.endTime);
        const durationMs = end.getTime() - start.getTime();
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor(
          (durationMs % (1000 * 60 * 60)) / (1000 * 60)
        );
        setJudgingDuration(`${hours} hours and ${minutes} minutes`);

        setEndTime(
          end.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        );
      }
      if (data.numTables) {
        setNumTables(data.numTables);
      }
    },
    onError: (error) => {
      setStatus("error");
      setErrorMessage(error.message);
      setTimeout(() => setStatus("idle"), 3000);
    },
  });

  return (
    <>
      <Head>
        <title>Judging Admin - DeltaHacks</title>
      </Head>
      <Drawer>
        <main className="px-7 py-16 sm:px-14 md:w-10/12 lg:pl-20 2xl:w-8/12 2xl:pt-20 mx-auto max-w-4xl">
          <h1 className="mb-8 text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl text-center">
            Judging Administration
          </h1>

          {/* CSV Upload Section */}
          <section className="mb-8 p-6 bg-base-100 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Import Project Data
            </h2>
            <div className="flex justify-center">
              <CSVUploader />
            </div>
          </section>

          {/* Schedule Configuration Section */}
          <section className="p-6 bg-base-100 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Schedule Configuration
            </h2>

            <div className="space-y-8 max-w-md mx-auto">
              {/* Time Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-center">
                  Time Settings
                </h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Time</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Duration per Project: {durationMinutes} minutes
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="5"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="range range-primary"
                  />
                </div>
              </div>

              {/* Track Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-center">
                  Table Settings
                </h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Projects per Table: {projectsPerTable}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={projectsPerTable}
                    onChange={(e) =>
                      setProjectsPerTable(Number(e.target.value))
                    }
                    className="range range-primary"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setStatus("loading");
                    createTables.mutate({ projectsPerTable });
                  }}
                  disabled={status === "loading"}
                  className={`px-6 py-2 rounded-md text-white transition-colors
                    ${status === "idle" ? "bg-primary hover:bg-primary/80" : ""}
                    ${status === "loading" ? "bg-blue-400" : ""}
                    ${status === "success" ? "bg-green-600" : ""}
                    ${status === "error" ? "bg-red-600" : ""}
                  `}
                  title={status === "error" ? errorMessage : ""}
                >
                  {status === "loading"
                    ? "Creating Schedule..."
                    : status === "success"
                    ? "Schedule Created!"
                    : "Create Schedule"}
                </button>
              </div>

              {(status === "success" || status === "loading") && (
                <div className="mt-6 space-y-2 text-center text-sm">
                  {judgingDuration && (
                    <p>Total Judging Duration: {judgingDuration}</p>
                  )}
                  {endTime && <p>End Time: {endTime}</p>}
                  {numTables && <p>Number of Tables: {numTables}</p>}
                </div>
              )}
            </div>
          </section>
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
    output
  );
  return output;
}

export default JudgingPage;
