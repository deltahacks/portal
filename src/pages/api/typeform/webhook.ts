/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Prisma } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const prisma = new PrismaClient();
  if (req.method === "POST") {
    //Check if user is already signed in to link form submission with registered user
    //access index of the answers array and get email ~ must be a better way if form changes
    //const formSubmitter = req.body.form_response.answers[0].text
    let formSubmitter = null;
    const questions = req.body.form_response.definition.fields;
    for (let i = 0; i < questions.length; i++) {
      if (questions[i].title.includes("email")) {
        formSubmitter = req.body.form_response.answers[i].text;
      }
    }
    const registeredUser = await prisma.user.findUnique({
      where: {
        email: formSubmitter,
      },
    });
    if (registeredUser && registeredUser.submitted == false) {
      const jsonAnswers = req.body as Prisma.JsonArray;
      const addResponses = await prisma.user.updateMany({
        where: { id: registeredUser.id },
        data: {
          answers: {
            update: jsonAnswers,
          },
          submitted: true,
        },
      });
      console.log("Received");
    } else if (registeredUser && registeredUser.submitted) {
      console.log("Submission already received");
    } else if (registeredUser == null) {
      console.log("User is not registered");
    }
    res.status(200).send({ message: "done" });
  } else if (req.method === "GET") {
    res
      .status(200)
      .send(JSON.stringify({ message: "This is a post endpoint" }));
  }
}
