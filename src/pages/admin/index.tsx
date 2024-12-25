import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextPage,
} from "next";
import Link from "next/link";
import { Role } from "@prisma/client";
import { rbac } from "../../components/RBACWrapper";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";
import { trpc } from "../../utils/trpc";
import Head from "next/head";
import Drawer from "../../components/Drawer";

const AdminCard = ({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) => (
  <Link href={href}>
    <div className="card bg-base-200 shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  </Link>
);

const Admin: NextPage = () => {
  const { mutateAsync } = trpc.admin.setKillSwitch.useMutation();

  return (
    <>
      <Head>
        <title>Admin Dashboard - DeltaHacks</title>
      </Head>
      <Drawer>
        <main className="px-7 py-16 sm:px-14 md:w-10/12 lg:pl-20 2xl:w-8/12 2xl:pt-20 mx-auto max-w-4xl">
          <h1 className="mb-8 text-2xl font-semibold leading-tight text-black dark:text-white sm:text-3xl lg:text-5xl 2xl:text-6xl text-center">
            Admin Dashboard
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <AdminCard
              title="Role Management"
              description="Manage user roles and permissions"
              href="/admin/roles"
            />
            <AdminCard
              title="Judging Management"
              description="Configure judging schedules and assignments"
              href="/admin/judging"
            />
            <AdminCard
              title="Time Slots"
              description="View and manage presentation time slots"
              href="/admin/timeslot"
            />
            <AdminCard
              title="Grading Portal"
              description="Access the application grading interface"
              href="/admin/grade"
            />
          </div>

          <div className="card bg-base-200 shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4">System Controls</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="btn btn-primary"
                onClick={async () => await mutateAsync(true)}
              >
                Kill Switch
              </button>
              <button
                className="btn btn-error"
                onClick={async () => await mutateAsync(false)}
              >
                Revive System
              </button>
            </div>
          </div>
        </main>
      </Drawer>
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

export default Admin;
