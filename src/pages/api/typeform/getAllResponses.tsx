import { NextApiRequest, NextApiResponse } from "next";
import { env } from "../../../env/server.mjs";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const promiseData = await fetch("https://api.typeform.com/forms/efTypANB/responses", {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.TYPEFORM_ACCESS_TOKEN}`,
      'Accept': 'application/json'
    }
  })
  const data = await promiseData.json()
  //console.log(JSON.stringify(JSON.parse(data), null, 2));
  res.status(200).json(data)
}