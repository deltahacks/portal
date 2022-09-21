import type { NextPage } from "next";
import React from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

const Home: NextPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6">
      <div className="btn btn-primary" onClick={() => signIn()}>
        Sign In
      </div>
      {/* <Link href={"/Login"}>Login</Link>
      <Link href={"/SignUp"}>Sign Up</Link>
      <Link href={"/ForgotPassword"}>Forgot Password</Link> */}
    </div>
  );
};

export default Home;
