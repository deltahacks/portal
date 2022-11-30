import { IncomingMessage, ServerResponse } from "http";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { Session } from "next-auth";

type RBACWrapperProps = {
  children: React.ReactNode;
  roles: string[];
  redirect?: string;
};

const RBACWrapper = ({
  children,
  roles,
  redirect = "/dashboard",
}: RBACWrapperProps) => {
  // logic handled on client side, since these are private routes SEO doesn't matter
  const { data: session } = useSession();
  const router = useRouter();
  const authorized = roles.some((r: string) =>
    session?.user?.role?.includes(r)
  );
  if (typeof window !== 'undefined' && !authorized) {
    router.push(redirect); // redirect to dashboard by default, can be overridden
  }
  return <>{children}</>;
};

export default RBACWrapper;
