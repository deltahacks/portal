import type { NextPage } from "next";
import React from "react";
import Link from "next/link";

const Home: NextPage = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen space-y-6">
            <Link href={"/Login"}>Login</Link>
            <Link href={"/SignUp"}>Sign Up</Link>
            <Link href={"/ForgotPassword"}>Forgot Password like a dumbass</Link>
        </div>
    );
};

export default Home;
