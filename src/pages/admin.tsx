import { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import RBACWrapper from "../components/RBACWrapper";
import { getServerAuthSession } from "../server/common/get-server-auth-session";

const Admin: NextPage = () => {
  const router = useRouter();
  return (
    <RBACWrapper roles={["ADMIN"]}>
      Tempor tempor ea ad consectetur consequat pariatur et officia est mollit
      nostrud.
    </RBACWrapper>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      session: await getServerAuthSession(context),
    },
  };
}

export default Admin;
