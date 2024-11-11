import React from "react";
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

const Admin: NextPage = () => {
  const { mutateAsync } = trpc.admin.setKillSwitch.useMutation();
  const { data } = trpc.admin.getApplicationCount.useQuery();

  return (
    <div className="p-4 md:p-8 flex flex-col items-center bg-white w-full h-full justify-center">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center p-8">Admin Dashboard</h2>
          <div className="space-y-4 flex flex-col gap-10">
            <div className="flex justify-between items-center bg-gray-600 p-6 md:p-10 rounded-full">
              <span className="text-lg md:text-2xl font-bold">
                Application Count:
              </span>
              <div className="w-16 h-16 md:w-20 md:h-20 bg-teal-300 text-white rounded-full flex justify-center items-center">
                <span className="font-bold text-lg md:text-2xl">
                  {data?.applicantCount}
                </span>
              </div>
            </div>
            <Link href="roles">
              <span className="link cursor-pointer">Manage Roles</span>
            </Link>
            <div>
              <h3 className="font-bold mb-2">Application Kill Switch</h3>
              <div className="flex justify-between">
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    await mutateAsync(true);
                  }}
                >
                  Kill
                </button>
                <button
                  className="btn btn-error"
                  onClick={async () => {
                    await mutateAsync(false);
                  }}
                >
                  Revive
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="card-footer">
          {/* <span className="text-sm text-gray-500">
            This is the admin dashboard for managing the application.
          </span> */}
        </div>
      </div>
    </div>
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
