import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "../auth/[...nextauth]";
import { env } from "../../../env/server.mjs";
import { Readable } from "stream";

const resume = async (req: NextApiRequest, res: NextApiResponse) => {
  const { path } = req.query;
  const jpath = (path as string[])?.join("/") || "";
  const session = await getServerSession(req, res, nextAuthOptions);

  if (
    session?.user?.role.includes("ADMIN") ||
    session?.user?.role.includes("REVIEWER")
  ) {
    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${env.TYPEFORM_API_KEY}`,
      },
    };
    const resp = await fetch(
      `https://api.typeform.com/forms/${jpath}`,
      options
    );

    res.setHeader("Content-type", resp.headers.get("content-type") || " ");

    if (resp.body === null || resp.body === undefined) {
      res.status(500).end();
    } else {
      Readable.fromWeb(resp.body as any)?.pipe(res);
    }
  } else {
    console.log("Not authorized");
    res.status(400).send({ content: "Invalid credentials" });
  }
};

export default resume;
