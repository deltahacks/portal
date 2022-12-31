<<<<<<< HEAD
import { GetServerSidePropsContext, NextPage } from "next";
=======
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextPage,
} from "next";
import { useRouter } from "next/router";
import { rbac } from "../components/RBACWrapper";
>>>>>>> main
import { getServerAuthSession } from "../server/common/get-server-auth-session";

const Admin: NextPage = () => {
  const router = useRouter();
  return (
    <>
      Tempor tempor ea ad consectetur consequat pariatur et officia est mollit
      nostrud.
    </>
  );
};

<<<<<<< HEAD
export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);

  // If the user is not an ADMIN, kick them back to the dashboard
  if (!session?.user?.role?.includes("ADMIN")) {
    return {
      redirect: { destination: "/dashboard", permanent: false },
    };
  }

  // Otherwise, continue.
  return { props: {} };
};
=======
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
>>>>>>> main

export default Admin;
