import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextPage,
} from "next";
import Link from "next/link";
import { rbac } from "../components/RBACWrapper";
import { getServerAuthSession } from "../server/common/get-server-auth-session";

// TODO
const Admin: NextPage = () => {
  return (
    <>
      Tempor tempor ea ad consectetur consequat pariatur et officia est mollit
      nostrud.
      <br />
      <Link href="roles">
        <span className="link">Roles</span>
      </Link>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  let output: GetServerSidePropsResult<Record<string, unknown>> = { props: {} };
  output = rbac(
    await getServerAuthSession(context),
    ["ADMIN"],
    undefined,
    output
  );
  return output;
}

export default Admin;
