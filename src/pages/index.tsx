import type { GetServerSidePropsContext, NextPage } from "next";
import { getServerAuthSession } from "../server/common/get-server-auth-session";

const Home: NextPage = () => {
  return <></>;
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);
  if (!session || !session.user) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  return { redirect: { destination: "/welcome", permanent: false } };
};

export default Home;
