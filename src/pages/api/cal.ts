import type { NextApiRequest, NextApiResponse } from "next";

const Cal = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const resProxy = await fetch(
      "https://calendar.google.com/calendar/ical/19061ded5963d8f3264d85463d16c008cd8212cccef06ab47901dbc9ea26d2b6%40group.calendar.google.com/private-24dac76dead730471c7f89cc3e949566/basic.ics",
    );
    // console.log(res.status);
    res.status(200).send(resProxy.body);
  } catch (error: any) {
    res.status(400).send(error.toSring());
  }
};

export default Cal;
