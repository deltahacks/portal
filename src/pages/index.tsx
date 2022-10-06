import type { GetServerSidePropsContext, NextPage } from "next";
import React from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { getServerAuthSession } from "../server/common/get-server-auth-session";

const Home: NextPage = () => {
  const session = useSession();

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-6">
      Hello to dashboard?
      {session.data?.user?.email}
      <button className="btn btn-error" onClick={() => signOut()}>
        Sign Out
      </button>
    </div>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);
  if (!session) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { props: {} };
};

export default Home;
