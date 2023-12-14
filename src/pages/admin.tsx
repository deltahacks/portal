import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextPage,
} from "next";
import Link from "next/link";
import { Role } from "@prisma/client";
import { rbac } from "../components/RBACWrapper";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { trpc } from "../utils/trpc";
``;
// TODO
const Admin: NextPage = () => {
  const { mutateAsync } = trpc.admin.setKillSwitch.useMutation();

  return (
    <>
      Tempor tempor ea ad consectetur consequat pariatur et officia est mollit
      nostrud.
      <br />
      <Link href="roles">
        <span className="link">Roles</span>
      </Link>
      <div>
        Application Kill Switch
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
