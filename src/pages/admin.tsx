import { GetServerSidePropsContext, NextPage } from "next";
import { getSession } from "next-auth/react";
import { getServerAuthSession } from "../server/common/get-server-auth-session";

const Admin: NextPage = () => {
  return (
    <>
      Tempor tempor ea ad consectetur consequat pariatur et officia est mollit
      nostrud.
    </>
  );
};

export const getServerSideProps = async (
  context: any,
  cdx: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);

  if (!session || !session.user || !session.user.role.includes("ADMIN")) {
    return {
      redirect: { destination: "/dashboard", permanent: false },
    };
  }

  return { props: {}};
};

export default Admin;
