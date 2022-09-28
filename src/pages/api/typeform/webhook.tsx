import { NextApiRequest, NextApiResponse } from "next";
import { env } from "../../../env/server.mjs";


export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' })
    return
  }
  const body = JSON.parse(req.body)
  return body
}
