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
import { keepPreviousData } from "@tanstack/react-query";

/**
 * Helper to step through time in X-minute increments from start to end.
 */
const generateTimeChunks = (start: Date, end: Date): Date[] => {
  const chunks: Date[] = [];
  let current = new Date(start);
  const stepMinutes = 10;

  while (current <= end) {
    chunks.push(new Date(current));
    current = new Date(current.getTime() + stepMinutes * 60_000);
  }
  return chunks;
};

const TimeSlotPage: NextPage = () => {
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [showOverview, setShowOverview] = useState(false);

  // 1) Grab relevant data
  const { data: timeSlots } = trpc.timeSlot.getAllTimeSlots.useQuery();
  const { data: tables } = trpc.table.getTables.useQuery();

  // We'll derive all 10-minute chunk boundaries from the earliest to the latest time.
  const [tenMinuteChunks, setTenMinuteChunks] = useState<Date[]>([]);

  useEffect(() => {
    if (timeSlots && timeSlots.length > 0) {
      const earliestStart = new Date(timeSlots[0]?.startTime || Date.now());
      const latestEnd = new Date(
        timeSlots[timeSlots.length - 1]?.startTime ??
          (timeSlots[0]?.startTime || Date.now()),
      );
      // Always use 10-minute chunks
      setTenMinuteChunks(generateTimeChunks(earliestStart, latestEnd));
    }
  }, [timeSlots]);

  // If we have some 10-min chunk boundaries, pick the one at currentTimeIndex
  const currentTime = tenMinuteChunks[currentTimeIndex];

  // For the timeline mode (not the overview), we need up to 3 sets of MLH assignments:
  //  - From currentTime
  //  - currentTime + 5 min
  //  - currentTime + 10 min
  // We fetch these only if currentTime is defined
  const timesToQuery = currentTime
    ? [
        currentTime,
        new Date(currentTime.getTime() + 5 * 60_000),
        new Date(currentTime.getTime() + 10 * 60_000),
      ]
    : [];
  // We'll grab the three assignment sets in parallel.
  // For normal tables, we'll only use index 0's data.
  // For MLH, we'll gather from all three.
  const firstAssignment = trpc.timeSlot.getAssignmentsAtTime.useQuery(
    { time: timesToQuery[0]?.toISOString() ?? "" },
    {
      enabled: !!currentTime && !!timeSlots && timesToQuery.length > 0,
    },
  );

  const secondAssignment = trpc.timeSlot.getAssignmentsAtTime.useQuery(
    { time: timesToQuery[1]?.toISOString() ?? "" },
    {
      enabled: !!currentTime && !!timeSlots && timesToQuery.length > 1,
      placeholderData: keepPreviousData,
    },
  );

  const thirdAssignment = trpc.timeSlot.getAssignmentsAtTime.useQuery(
    { time: timesToQuery[2]?.toISOString() ?? "" },
    {
      enabled: !!currentTime && !!timeSlots && timesToQuery.length > 2,
      placeholderData: keepPreviousData,
    },
  );

  const assignmentQueries = [
    firstAssignment,
    secondAssignment,
    thirdAssignment,
  ];

  // Now we can unify them in a helper function:
  const getAssignmentsForTable = (tableId: string, isMlh: boolean) => {
    if (!isMlh) {
      // For non-MLH tables, just use the first query result
      return assignmentQueries[0]?.data?.[tableId] ?? null;
    } else {
      // For MLH, gather all three
      const first = assignmentQueries[0]?.data?.[tableId] ?? null;
      const second = assignmentQueries[1]?.data?.[tableId] ?? null;
      const third = assignmentQueries[2]?.data?.[tableId] ?? null;

      // Return an array of projects (some might be null if no assignment at that 5-min block)
      const mlhProjects = [first, second, third].filter(Boolean);
      return mlhProjects;
    }
  };

  // If the queries or data isn't ready, we show a loading state
  if (!timeSlots || !tables || tenMinuteChunks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  /**
   * TableOverview:
   * Shows two sections:
   *  -- Non-MLH tables (10-minute increments)
   *  -- MLH table (5-minute increments)
   * Each section is displayed as a table with rows indicating time chunks.
   */
  const TableOverview: React.FC = () => {
    if (!timeSlots?.length) {
      return <div>No time slots found.</div>;
    }

    // Separate the MLH table from the rest
    const mlhTable = tables.find((t) => t.track.name === "MLH");
    const nonMlhTables = tables.filter((t) => t.track.name !== "MLH");

    // Derive an earliest start and latest end from timeSlots.
    const earliestStartTime = timeSlots[0]?.startTime ?? new Date();
    const latestEndTime =
      timeSlots[timeSlots.length - 1]?.endTime ?? new Date();

    // Generate the increments with fixed 10-minute chunks
    const chunks = generateTimeChunks(earliestStartTime, latestEndTime);

    /**
     * A small row component that grabs the assignment for the given time/table.
     * For demonstration, we do a separate query per row/time/table.
     * (In a large-scale scenario, you'd likely want a combined approach
     *  to avoid many repeated queries. This is simplified for illustration.)
     */
    const TimeRowCell: React.FC<{
      chunk: Date;
      tableId: string;
    }> = ({ chunk, tableId }) => {
      const { data: assignments } = trpc.timeSlot.getAssignmentsAtTime.useQuery(
        { time: chunk.toISOString() },
        { enabled: !!chunk },
      );
      const project = assignments?.[tableId];
      return (
        <td className="border dark:border-neutral-800 p-3 text-sm bg-white dark:bg-neutral-900 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800">
          {project ? (
            <span className="font-medium text-gray-900 dark:text-white">
              {project.name}
            </span>
          ) : (
            <span className="text-gray-400 dark:text-gray-600">—</span>
          )}
        </td>
      );
    };

    return (
      <div className="flex flex-col gap-8 px-8 max-w-[95%] mx-auto">
        {/* Non-MLH tables */}
        <section>
          <h2 className="text-xl font-semibold mb-6 text-black dark:text-white border-b pb-2 dark:border-neutral-800">
            Non-MLH Tables (10-minute increments)
          </h2>
          {nonMlhTables.length === 0 ? (
            <div className="text-gray-500 italic">No non-MLH tables found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse shadow-sm rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100 dark:bg-neutral-800">
                    <th className="border dark:border-neutral-700 p-3 text-left font-semibold text-gray-900 dark:text-white">
                      Time
                    </th>
                    {nonMlhTables.map((table) => (
                      <th
                        key={table.id}
                        className="border dark:border-neutral-700 p-3 text-left font-semibold text-gray-900 dark:text-white"
                      >
                        Table {table.number} - {table.track.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chunks.map((chunk) => (
                    <tr key={chunk.toISOString()}>
                      {/* Time label */}
                      <td className="border dark:border-neutral-800 p-2 text-sm bg-gray-100 dark:bg-neutral-900">
                        {chunk.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </td>
                      {/* One cell per non-MLH table */}
                      {nonMlhTables.map((table) => (
                        <TimeRowCell
                          key={`${table.id}-${chunk.toISOString()}`}
                          chunk={chunk}
                          tableId={table.id}
                        />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* MLH table (if it exists) */}
        <section>
          <h2 className="text-xl font-semibold mb-6 text-black dark:text-white border-b pb-2 dark:border-neutral-800">
            MLH Table (5-minute increments)
          </h2>
          {!mlhTable ? (
            <div className="text-gray-500 italic">No MLH table found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse shadow-sm rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100 dark:bg-neutral-800">
                    <th className="border dark:border-neutral-700 p-3 text-left font-semibold text-gray-900 dark:text-white">
                      Time
                    </th>
                    <th className="border dark:border-neutral-700 p-3 text-left font-semibold text-gray-900 dark:text-white">
                      Table {mlhTable.number} - MLH
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {chunks
                    .flatMap((chunk) => [
                      // For each 10-minute chunk, create two 5-minute rows
                      new Date(chunk),
                      new Date(chunk.getTime() + 5 * 60_000),
                    ])
                    .map((chunk) => (
                      <tr key={chunk.toISOString()}>
                        {/* Time label */}
                        <td className="border dark:border-neutral-800 p-2 text-sm bg-gray-100 dark:bg-neutral-900">
                          {chunk.toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </td>
                        <TimeRowCell
                          key={`${mlhTable.id}-${chunk.toISOString()}`}
                          chunk={chunk}
                          tableId={mlhTable.id}
                        />
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
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
                  {showOverview ? "Project Overview" : "Project Timeline"}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Overview</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={showOverview}
                    onChange={() => setShowOverview(!showOverview)}
                  />
                  <span className="text-sm text-gray-500">Timeline</span>
                </div>
              </div>

              {/* Timeline view is the new 10-min slider approach; 
                  Overview view is the existing chunk-based schedule. */}
              {!showOverview ? (
                <>
                  {/* -- Timeline (revamped) -- */}
                  <div className="mb-8">
                    <div className="mb-2">
                      {currentTime && (
                        <span className="text-2xl font-light text-gray-900 dark:text-white">
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
                      max={Math.max(0, tenMinuteChunks.length - 1)}
                      value={currentTimeIndex}
                      onChange={(e) =>
                        setCurrentTimeIndex(Number(e.target.value))
                      }
                      className="range range-primary w-full max-w-2xl"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tables.map((table) => {
                      const isMlh = table.track.name === "MLH";
                      const assignmentData = getAssignmentsForTable(
                        table.id,
                        isMlh,
                      );

                      return (
                        <div
                          key={table.id}
                          className="card bg-white dark:bg-base-200 shadow-xl"
                        >
                          <div className="card-body">
                            <h3 className="card-title text-gray-900 dark:text-white">
                              Table {table.number} - {table.track.name}
                            </h3>
                            {/* If MLH, array of up to 3 projects. Otherwise, single project. */}
                            {!isMlh ? (
                              <>
                                {Array.isArray(assignmentData)
                                  ? assignmentData.map(
                                      (project, idx) =>
                                        project && (
                                          <div
                                            key={`${project.id}-${idx}`}
                                            className="p-3 my-2 bg-gray-100 dark:bg-neutral-900 rounded border dark:border-neutral-800"
                                          >
                                            <p className="font-medium text-gray-900 dark:text-white">
                                              {project.name}
                                            </p>
                                            {/* Add time range display logic here if needed */}
                                          </div>
                                        ),
                                    )
                                  : assignmentData && (
                                      <div className="p-3 bg-gray-100 dark:bg-neutral-900 rounded border dark:border-neutral-800">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                          {assignmentData.name}
                                        </p>
                                        {/* Shows the relevant 10-min window */}
                                      </div>
                                    )}
                              </>
                            ) : (
                              // MLH => up to 3 assignments
                              <>
                                {Array.isArray(assignmentData) &&
                                assignmentData.length > 0 ? (
                                  assignmentData.map((project, idx) => {
                                    // each project covers a 5-min sub-slot in this 10-min chunk
                                    const subSlotStart = new Date(
                                      currentTime?.getTime() ??
                                        Date.now() + idx * 5 * 60_000,
                                    );
                                    const subSlotEnd = new Date(
                                      subSlotStart.getTime() + 5 * 60_000,
                                    );

                                    return (
                                      <div
                                        key={project?.id ?? idx}
                                        className="p-3 my-2 bg-gray-100 dark:bg-neutral-900 rounded border dark:border-neutral-800"
                                      >
                                        <p className="font-medium text-gray-900 dark:text-white">
                                          {project?.name}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-[#c1c1c1]">
                                          {subSlotStart.toLocaleTimeString(
                                            "en-US",
                                            {
                                              hour: "numeric",
                                              minute: "2-digit",
                                            },
                                          )}
                                          {" - "}
                                          {subSlotEnd.toLocaleTimeString(
                                            "en-US",
                                            {
                                              hour: "numeric",
                                              minute: "2-digit",
                                            },
                                          )}
                                        </p>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <p className="text-gray-500 dark:text-[#c1c1c1] italic">
                                    No project scheduled
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
    output,
  );
  return output;
}

export default TimeSlotPage;
