import { NextPage } from "next";
import { getServerAuthSession } from "../server/common/get-server-auth-session";

const Admin: NextPage = () => {
  return (
    <>
      Tempor tempor ea ad consectetur consequat pariatur et officia est mollit
      nostrud.
    </>
  );
};

export const getServerSideProps = async (context: any) => {
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

export default Admin;
