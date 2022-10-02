import type { GetServerSidePropsContext, NextPage } from "next";
import React from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex h-screen flex-col items-center justify-center space-y-6">

      </div>
    </>
  );
};

export default Home;
