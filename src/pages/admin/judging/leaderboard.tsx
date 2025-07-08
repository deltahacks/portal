import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  type NextPage,
} from "next";
import Head from "next/head";
import { trpc } from "../../../utils/trpc";
import Drawer from "../../../components/Drawer";
import { getServerAuthSession } from "../../../server/common/get-server-auth-session";
import { rbac } from "../../../components/RBACWrapper";
import { Role } from "@prisma/client";
import { useState } from "react";

const LeaderboardPage: NextPage = () => {
  const [selectedTrackId, setSelectedTrackId] = useState<string>("all");

  const { data: tracks } = trpc.track.getTracks.useQuery();
  const { data: leaderboard, isPending } = trpc.judging.getLeaderboard.useQuery(
    { trackId: selectedTrackId === "all" ? undefined : selectedTrackId },
    {
      refetchInterval: 30 * 1000,
      refetchIntervalInBackground: true,
    },
  );

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Judging Leaderboard</title>
        <meta name="description" content="DeltaHacks Judging Leaderboard" />
      </Head>

      <div className="drawer drawer-end relative h-full min-h-screen w-full overflow-x-hidden font-montserrat">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

        <Drawer pageTabs={[{ pageName: "Judging", link: "/judging" }]}>
          <main className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Project Leaderboard</h1>
              <select
                className="select select-bordered w-full max-w-xs"
                value={selectedTrackId}
                onChange={(e) => setSelectedTrackId(e.target.value)}
              >
                <option value="all">All Tracks</option>
                {tracks?.map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Project Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Link
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Judges
                    </th>
                    {selectedTrackId === "all" && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Track
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {leaderboard?.map((project, index) => (
                    <tr
                      key={project.projectId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {project.projectName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {project.link ? (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            View Project
                          </a>
                        ) : (
                          <span className="text-sm text-gray-500">No link</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {project.score.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {project.numberOfJudges}
                        </div>
                      </td>
                      {selectedTrackId === "all" && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {project.trackName}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
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

export default LeaderboardPage;
