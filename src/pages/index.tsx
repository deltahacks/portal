import type { GetServerSidePropsContext, NextPage } from "next";
import React from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { getServerAuthSession } from "../server/common/get-server-auth-session";

const Home: NextPage = () => {
  const session = useSession();

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6">
      Hello to dashboard?
      {session.data?.user?.email}
      <button className="btn btn-error" onClick={() => signOut()}>
        Sign Out
      </button>
      {/* <Link href={"/Login"}>Login</Link>
      <Link href={"/SignUp"}>Sign Up</Link>
      <Link href={"/ForgotPassword"}>Forgot Password</Link> */}
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
