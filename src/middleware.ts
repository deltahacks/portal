import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { NextRequest, NextResponse } from "next/server";

const rbac = async (req: NextRequest, roles: string[]) => {
  // this doesn't work since the types don't match
  // TODO: investigate if there's a feasible way to do this well
  // const session = await getSession({ req });
  // if (!session) {
  //     return false;
  // } else {
  //     return roles.some((role) => session.user?.role?.includes(role));
  // }
};

export const middleware = () => {
  return;
};
