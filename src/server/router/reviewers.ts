import { z } from "zod";
import { createProtectedRouter } from "./context";
import { env } from "../../env/server.mjs";

const TypeFormResponseField = z.object({
  field: z.object({
    id: z.string(),
    type: z.string(),
    ref: z.string(),
  }),
  type: z.string(),
  text: z.string().nullish(),
  date: z.date().nullish(),
  file_url: z.string().nullish(),
  boolean: z.boolean().nullish(),
  phone_number: z.string().nullish(),
  email: z.string().email().nullish(),
});

type TypeFormResponseField = z.infer<typeof TypeFormResponseField>;

const TypeFormResponseItems = z.array(
  z.object({
    landing_id: z.string(),
    token: z.string(),
    response_id: z.string(),
    landed_at: z.date(),
    submitted_at: z.date(),
    metadata: z.object({
      user_agent: z.string(),
      platform: z.string(),
      referer: z.string(),
      network_id: z.string(),
      browser: z.string(),
    }),
    hidden: z.object({
      bobthebuilder: z.string(),
    }),
    calculated: z.object({
      score: z.number(),
    }),
    answers: z.array(TypeFormResponseField),
  })
);

type TypeFormResponseItems = z.infer<typeof TypeFormResponseItems>;

const TypeFormResponse = z.object({
  total_items: z.number(),
  page_count: z.number(),
  items: TypeFormResponseItems,
});

type TypeFormResponse = z.infer<typeof TypeFormResponse>;

// TODO: Double check this type
const TypeFormSubmission = z.object({
  response_id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  birthday: z.date(),
  major: z.string(),
  school: z.string(),
  willBeEnrolled: z.boolean(),
  graduationYear: z.date(),
  degree: z.string(),
  currentLevel: z.string(),
  hackathonCount: z.string(),
  longAnswer1: z.string(),
  longAnswer2: z.string(),
  longAnswer3: z.string(),
  socialLinks: z.string().nullish(),
  resume: z.string().nullish(),
  extra: z.string().nullish(),
  tshirtSize: z.string(),
  hackerType: z.string(),
  hasTeam: z.boolean(),
  workShop: z.string().nullish(),
  gender: z.string(),
  considerSponserChat: z.boolean().nullish(),
  howDidYouHear: z.string(),
  background: z.string(),
  emergencyContactInfo: z.object({
    firstName: z.string(),
    lastName: z.string(),
    phoneNumber: z.string(),
    email: z.string().email().nullish(),
  }),
  mlhAgreement: z.boolean(),
  mlhCoc: z.boolean(),
});

type TypeFormSubmission = z.infer<typeof TypeFormSubmission>;

const options = {
  method: "GET",
  headers: {
    Authorization: `Bearer ${env.TYPEFORM_API_KEY}`,
  },
};

export const reviewerRouter = createProtectedRouter()
  // get reviewed applications, not used
  // .query("getReviewed", {
  //   async resolve({ ctx }) {
  //     const fullyReviewedApplicants = await ctx.prisma
  //       .$queryRaw`SELECT "typeform_response_id" FROM (SELECT "hackerId" as id, COUNT("hackerId") as reviewCount, "typeform_response_id"  FROM "Review" JOIN "User" ON "User".id = "hackerId" GROUP BY "hackerId", "typeform_response_id") AS ids WHERE reviewCount >= 3`;
  //   },
  // })
  //get applications without enough reviews
  .query("getApplications", {
    async resolve({ ctx }) {
      // select all user and their review details joining user on review
      const dbdata = await ctx.prisma.user.findMany({
        include: {
          hacker: {
            select: {
              id: true,
              hacker: true,
              mark: true,
              reviewer: true,
            },
          },
        },
      });

      const mappedUsers = new Map();

      dbdata
        .map((item) => {
          return {
            typeform_response_id: item.typeform_response_id,
            reviewer: item.hacker,
            id: item.id,
          };
        })
        .filter((item) => item.typeform_response_id != undefined)
        .forEach((item) => mappedUsers.set(item.typeform_response_id, item));

      const url = `https://api.typeform.com/forms/MVo09hRB/responses?completed=true&before=nek0xhmtbf1nyt91nn2ts05lnek0xhm8&page_size=220`;
      const res = await fetch(url, options);
      const data: TypeFormResponse = await res.json();

      //shuffle the responses
      ((array: TypeFormResponseItems) => {
        let currentIndex = array.length,
          randomIndex;

        while (currentIndex != 0) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;

          const random = array[randomIndex];
          const current = array[currentIndex];

          // Check for undefined warnings
          if (random && current) {
            [array[currentIndex], array[randomIndex]] = [random, current];
          }
        }
        return array;
      })(data.items);

      // Convert from TypeFormResponse to TypeFormSubmission
      const converted: TypeFormSubmission[] = data.items.map((item) => {
        const responsePreprocessing: Map<string, TypeFormResponseField> =
          new Map();
        for (const answer of item.answers) {
          responsePreprocessing.set(answer.field.id, answer);
        }
        return {
          response_id: item.response_id,
          firstName: responsePreprocessing.get("nfGel41KT3dP")?.text,
          lastName: responsePreprocessing.get("mwP5oTr2JHgD")?.text,
          birthday: new Date(responsePreprocessing.get("m7lNzS2BDhp1").date),
          major: responsePreprocessing.get("PzclVTL14dsF")?.text,
          school: responsePreprocessing.get("63Wa2JCZ1N3R")?.text,
          willBeEnrolled: responsePreprocessing.get("rG4lrpFoXXpL")?.boolean,
          graduationYear: new Date(
            responsePreprocessing.get("Ez47B6N0QzKY")?.date
          ),
          degree: responsePreprocessing.get("035Ul4T9mldq")?.text,
          currentLevel: responsePreprocessing.get("3SPBWlps2PBj")?.text,
          hackathonCount: responsePreprocessing.get("MyObNZSNMZOZ")?.text,
          longAnswer1: responsePreprocessing.get("rCIqmnIUzvAV")?.text,
          longAnswer2: responsePreprocessing.get("h084NVJ0kEsO")?.text,
          longAnswer3: responsePreprocessing.get("wq7KawPVuW4I")?.text,
          socialLinks: responsePreprocessing.get("CE5WnCcBNEtj")?.text,
          resume: responsePreprocessing
            .get("z8wTMK3lMO00")
            ?.file_url?.replace(
              "https://api.typeform.com/forms",
              "/api/resumes"
            ),
          extra: responsePreprocessing.get("GUpky3mnQ3q5")?.text,
          tshirtSize: responsePreprocessing.get("Q9xv6pezGeSc")?.text,
          hackerType: responsePreprocessing.get("k9BrMbznssVX")?.text,
          hasTeam: responsePreprocessing.get("3h36sGge5G4X")?.boolean,
          workShop: responsePreprocessing.get("Q3MisVaz3Ukw")?.text,
          gender: responsePreprocessing.get("b3sr6g16jGjj")?.text,
          considerSponserChat:
            responsePreprocessing.get("LzF2H4Fjfwvq")?.boolean,
          howDidYouHear: responsePreprocessing.get("OoutsXd4RFcR")?.text,
          background: responsePreprocessing.get("kGs2PWAnqBI3")?.text,
          emergencyContactInfo: {
            firstName: responsePreprocessing.get("o5rMp5fj0BMa")?.text,
            lastName: responsePreprocessing.get("irlsiZFKVJKD")?.text,
            phoneNumber:
              responsePreprocessing.get("ceNTt9oUhO6Q")?.phone_number,
            email: responsePreprocessing.get("onIT7bTImlRj")?.email,
          },
          mlhAgreement: responsePreprocessing.get("F3vbQhObxXFa")?.boolean,
          mlhCoc: responsePreprocessing.get("f3ELfiV5gVSs")?.boolean,
        };
      });
      // filter responses to get the ones that need review
      const output = converted
        .filter((item) => mappedUsers.has(item.response_id))
        .map((item) => {
          return {
            ...item,
            reviews: mappedUsers.get(item.response_id).reviewer,
            hackerId: mappedUsers.get(item.response_id).id,
          };
        });

      return { data: output };
    },
  })
  .mutation("submit", {
    input: z.object({ mark: z.number(), hackerId: z.string() }),
    async resolve({ ctx, input }) {
      const res = await ctx.prisma.review.findFirst({
        where: {
          hackerId: input.hackerId,
          reviewerId: ctx.session.user.id,
        },
      });
      if (res) {
        throw new Error("Duplicate Review");
      }
      await ctx.prisma.review.create({
        data: {
          hackerId: input.hackerId,
          reviewerId: ctx.session.user.id,
          mark: input.mark,
        },
      });
    },
  });
