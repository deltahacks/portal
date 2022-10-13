import type { GetServerSidePropsContext, NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import { getServerAuthSession } from "../server/common/get-server-auth-session";

const Home: NextPage = () => {
  return <></>;
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);
  if (!session || !session.user) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  const res = await prisma?.user.findFirst({ where: { id: session.user.id } });
  if (res?.typeform_response_id !== null) {
    return { redirect: { destination: "/dashboard", permanent: false } };
  }
  return { redirect: { destination: "/welcome", permanent: false } };
};

export default Home;
