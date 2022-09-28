import { NextApiRequest, NextApiResponse } from "next";
import { env } from "../../../env/server.mjs";

let stuff: any[] = []

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const body = JSON.parse(req.body)
  console.log(body);
  stuff.push(body);
  return body
}
