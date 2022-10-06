import { NextApiRequest, NextApiResponse } from "next";
import { env } from "../../../env/server.mjs";
import { PrismaClient, Prisma } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const prisma = new PrismaClient()
  if (req.method === 'POST') {
    //Check if user is already signed in to link form submission with registered user
    //access index of the answers array and get email ~ must be a better way if form changes
    const formSubmitter = req.body.form_response.answers[0].text
    console.log(formSubmitter);
    const registeredUser = await prisma.user.findUnique({
      where: {
        email: formSubmitter,
      },
    })
    if (registeredUser) {
      var jsonAnswers = req.body.form_response.answers as Prisma.JsonArray
      const addResponses = await prisma.user.create({
        data: {
          answers: { name: "jeff" }
        },
      })
    }
    res.status(200).send({ message: "Received" })
  } else if (req.method === 'GET') {
    const users = await prisma.user.findMany()
    console.log(users)
    res.status(200).send(users)
  }
}

