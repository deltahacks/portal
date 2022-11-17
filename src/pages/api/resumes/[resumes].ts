import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "../auth/[...nextauth]";

const resume = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, nextAuthOptions);
  console.log(session);
  if (session) {
    console.log(session.user);
  }

  if (
    session?.user?.role.includes("ADMIN") ||
    session?.user?.role.includes("REVIEWER")
  ) {
  } else {
    res.status(400).send({ content: "Invalid credentials" });
  }
};

export default resume;
