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

const LeaderboardPage: NextPage = () => {
  const { data: leaderboard, isLoading } = trpc.judging.getLeaderboard.useQuery(
    undefined,
    {
      refetchInterval: 30 * 1000,
      refetchIntervalInBackground: true,
    }
  );

  if (isLoading) {
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
            <h1 className="text-2xl font-bold mb-8">Project Leaderboard</h1>

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
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Judges
                    </th>
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
                        <div className="text-sm text-gray-900 dark:text-white">
                          {project.score.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {project.numberOfJudges}
                        </div>
                      </td>
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
    output
  );
  return output;
}

export default LeaderboardPage;
