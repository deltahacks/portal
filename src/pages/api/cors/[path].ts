import { NextApiRequest, NextApiResponse } from "next";

const Cors = async (req: NextApiRequest, res: NextApiResponse) => {
  const url = req.url?.replace("/api/cors/a?path=", "");
  console.log(url);

  try {
    const resProxy = await fetch(url ?? "");
    // console.log(res.status);
    res.status(200).send(resProxy.body);
  } catch (error: any) {
    res.status(400).send(error.toSring());
  }
};

export default Cors;
