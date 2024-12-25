import { useState, useEffect } from "react";
import Head from "next/head";
import { trpc } from "../../utils/trpc";
import Drawer from "../../components/Drawer";
import { Role } from "@prisma/client";
import { rbac } from "../../components/RBACWrapper";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";
import type {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextPage,
} from "next";

const TimeSlotPage: NextPage = () => {
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [showOverview, setShowOverview] = useState(false);

  const { data: timeSlots } = trpc.timeSlot.getAllTimeSlots.useQuery();
  const { data: tables } = trpc.table.getTables.useQuery();

  const currentTime = timeSlots?.[currentTimeIndex]?.startTime;

  const { data: tableAssignments } =
    trpc.timeSlot.getAssignmentsAtTime.useQuery(
      { time: currentTime?.toISOString() ?? "" },
      { enabled: !!currentTime }
    );

  if (!timeSlots || !tables) return <div>Loading...</div>;

  const TableOverview: React.FC = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 px-8">
        {[...(tables ?? [])]
          .sort((a, b) => (a.number > b.number ? 1 : -1))
          .map((table) => {
            return (
              <div key={table.id}>
                <div className="font-bold p-4 bg-white dark:bg-neutral-900 border dark:border-neutral-800">
                  Table {table.number}
                  <br />
                  {table.track.name}
                </div>
                {timeSlots?.map((slot) => {
                  const project = tableAssignments?.[table.id];
                  const { data: assignmentsForSlot } =
                    trpc.timeSlot.getAssignmentsAtTime.useQuery(
                      { time: slot.startTime.toISOString() },
                      { enabled: !!slot.startTime }
                    );
                  const projectForSlot = assignmentsForSlot?.[table.id];

                  return (
                    <div
                      key={`${table.id}-${slot.startTime.toISOString()}`}
                      className="border dark:border-neutral-800 p-4 bg-gray-50 dark:bg-neutral-950"
                    >
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {slot.startTime.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                      {projectForSlot ? (
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {projectForSlot.name}
                        </h3>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">
                          No project
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Project Timeline - DeltaHacks XI</title>
      </Head>

      <div className="drawer drawer-end relative h-full min-h-screen w-full overflow-x-hidden font-montserrat">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

        <Drawer pageTabs={[{ pageName: "Timeline", link: "/admin/timeslot" }]}>
          <main className="px-7 py-16 sm:px-14 lg:pl-20 2xl:pt-20">
            <div className="container mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl">
                  Project Timeline
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Timeline View</span>
                  <button
                    onClick={() => setShowOverview(!showOverview)}
                    className={`px-4 py-2 rounded-md ${
                      showOverview
                        ? "bg-primary text-white"
                        : "bg-neutral-700 text-gray-200"
                    }`}
                  >
                    {showOverview ? "Overview" : "Timeline"}
                  </button>
                </div>
              </div>

              {!showOverview ? (
                <>
                  <div className="mb-8">
                    <div className="mb-2">
                      {currentTime && (
                        <span className="text-xl font-normal text-gray-900 dark:text-[#c1c1c1] sm:text-2xl">
                          {currentTime.toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, timeSlots.length - 1)}
                      value={currentTimeIndex}
                      onChange={(e) =>
                        setCurrentTimeIndex(Number(e.target.value))
                      }
                      className="w-full max-w-2xl"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tables.map((table) => (
                      <div
                        key={table.id}
                        className="card bg-white dark:bg-base-200 shadow-xl"
                      >
                        <div className="card-body">
                          <h3 className="card-title text-gray-900 dark:text-white">
                            Table {table.number} - {table.track.name}
                          </h3>
                          {tableAssignments?.[table.id] ? (
                            <div className="p-3 bg-gray-100 dark:bg-neutral-900 rounded border dark:border-neutral-800">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {tableAssignments?.[table.id]?.name}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-[#c1c1c1]">
                                {currentTime?.toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}{" "}
                                -{" "}
                                {(
                                  timeSlots[currentTimeIndex]?.endTime ??
                                  currentTime
                                )?.toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          ) : (
                            <p className="text-gray-500 dark:text-[#c1c1c1] italic">
                              No project scheduled
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <TableOverview />
              )}
            </div>
          </main>
        </Drawer>
      </div>
    </>
  );
};

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

export default TimeSlotPage;
