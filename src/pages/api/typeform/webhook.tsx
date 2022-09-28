import { NextApiRequest, NextApiResponse } from "next";
import { env } from "../../../env/server.mjs";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const body = JSON.parse(req.body)
  console.log(body);
  return body
}
