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

        const submission = {
          response_id: item.response_id,
          { name: "firstName", key: "nfGel41KT3dP", field: "text" },
          { name: "lastName", key: "mwP5oTr2JHgD", field: "text" },
          { name: "birthday", key: "m7lNzS2BDhp1", field: "ate)" },
          { name: "major", key: "PzclVTL14dsF", field: "text" },
          { name: "school", key: "63Wa2JCZ1N3R", field: "text" },
          { name: "willBeEnrolled", key: "rG4lrpFoXXpL", field: "boolean" },
          graduationYear: new Date(
            responsePreprocessing.get("Ez47B6N0QzKY").date
          ),
          { name: "degree", key: "035Ul4T9mldq", field: "text" },
          { name: "currentLevel", key: "3SPBWlps2PBj", field: "text" },
          { name: "hackathonCount", key: "MyObNZSNMZOZ", field: "text" },
          { name: "longAnswer1", key: "rCIqmnIUzvAV", field: "text" },
          { name: "longAnswer2", key: "h084NVJ0kEsO", field: "text" },
          { name: "longAnswer3", key: "wq7KawPVuW4I", field: "text" },
          { name: "socialLinks", key: "CE5WnCcBNEtj", field: "text" },
          resume: responsePreprocessing
            .get("z8wTMK3lMO00")
            ?.file_url?.replace(
              "https://api.typeform.com/forms",
              "/api/resumes"
            ),
          { name: "extra", key: "GUpky3mnQ3q5", field: "text" },
          { name: "tshirtSize", key: "Q9xv6pezGeSc", field: "text" },
          { name: "hackerType", key: "k9BrMbznssVX", field: "text" },
          { name: "hasTeam", key: "3h36sGge5G4X", field: "boolean" },
          { name: "workShop", key: "Q3MisVaz3Ukw", field: "text" },
          { name: "gender", key: "b3sr6g16jGjj", field: "text" },
          { name: "considerSponserChat", key: "LzF2H4Fjfwvq", field: "boolean" },
          { name: "howDidYouHear", key: "OoutsXd4RFcR", field: "text" },
          { name: "background", key: "kGs2PWAnqBI3", field: "text" },
          emergencyContactInfo: {
            { name: "firstName", key: "o5rMp5fj0BMa", field: "text" },
            { name: "lastName", key: "irlsiZFKVJKD", field: "text" },
            { name: "phoneNumber", key: "ceNTt9oUhO6Q", field: "phone_number" },
            { name: "email", key: "onIT7bTImlRj", field: "email" },
          },
          { name: "mlhAgreement", key: "F3vbQhObxXFa", field: "boolean" },
          { name: "mlhCoc", key: "f3ELfiV5gVSs", field: "boolean" },
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
