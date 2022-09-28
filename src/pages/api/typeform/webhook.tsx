import { NextApiRequest, NextApiResponse } from "next";
import { env } from "../../../env/server.mjs";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    console.log(JSON.parse(req.body))
    return JSON.parse(req.body)
  } else {
    return { error: "You can only make post" }
  }
}
