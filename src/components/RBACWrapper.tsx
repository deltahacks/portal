import { Session } from "next-auth";
import { GetServerSidePropsResult } from "next";

export const rbac = (
  session: Session | null,
  roles: string[],
  redirect = "/dashboard",
  inObj: GetServerSidePropsResult<Record<string, unknown>>,
): GetServerSidePropsResult<Record<string, unknown>> => {
  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  const authorized = roles.some((r: string) =>
    session?.user?.role?.includes(r),
  );
  if (!authorized) {
    return {
      redirect: {
        destination: redirect,
        permanent: false,
      },
    };
  } else {
    return inObj;
  }
};
