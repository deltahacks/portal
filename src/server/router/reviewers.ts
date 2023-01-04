import { z } from "zod";
import { createProtectedRouter } from "./context";
import { env } from "../../env/server.mjs";
import { Role, Status, User } from "@prisma/client";
import * as trpc from "@trpc/server";

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
  hackerId: z.string(),
  reviews: z.array(
    z.object({
      id: z.string(),
      reviewer: z.object({
        id: z.string(),
        name: z.string().nullable(),
        email: z.string().email().nullable(),
        emailVerified: z.date().nullable(),
        image: z.string().nullable(),
        typeform_response_id: z.string().nullable().nullable(),
        role: z.array(z.enum([Role.HACKER, Role.REVIEWER, Role.ADMIN])),
        status: z.enum([
          Status.ACCEPTED,
          Status.CHECKED_IN,
          Status.IN_REVIEW,
          Status.REJECTED,
          Status.RSVP,
          Status.WAITLISTED,
        ]),
      }),
      hacker: z.object({
        id: z.string(),
        name: z.string().nullable(),
        email: z.string().email().nullable(),
        emailVerified: z.date().nullable(),
        image: z.string().nullable(),
        typeform_response_id: z.string().nullable(),
        role: z.array(z.enum([Role.HACKER, Role.REVIEWER, Role.ADMIN])),
        status: z.enum([
          Status.ACCEPTED,
          Status.CHECKED_IN,
          Status.IN_REVIEW,
          Status.REJECTED,
          Status.RSVP,
          Status.WAITLISTED,
        ]),
      }),
      mark: z.number(),
    })
  ),
  email: z.string().nullable(),
});

export type TypeFormSubmission = z.infer<typeof TypeFormSubmission>;

interface Item {
  typeform_response_id: string | null;
  reviewer: {
    id: string;
    reviewer: User;
    hacker: User;
    mark: number;
  }[];
  id: string;
  email: string | null;
}

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
      if (
        !(
          ctx.session.user.role.includes("ADMIN") ||
          ctx.session.user.role.includes("REVIEWER")
        )
      ) {
        throw new trpc.TRPCError({ code: "UNAUTHORIZED" });
      }

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

      const mappedUsers = new Map<string | null, Item>();

      dbdata
        .map((item) => {
          return {
            typeform_response_id: item.typeform_response_id,
            reviewer: item.hacker,
            id: item.id,
            email: item.email,
          };
        })
        .filter((item) => item.typeform_response_id != undefined)
        .forEach((item) => mappedUsers.set(item.typeform_response_id, item));

      const url = `https://api.typeform.com/forms/MVo09hRB/responses?completed=true&page_size=1000`;
      const res = await fetch(url, options);
      const data: TypeFormResponse = await res.json();

      // Convert from TypeFormResponse to TypeFormSubmission
      const converted: TypeFormSubmission[] = data.items.map((item) => {
        const responsePreprocessing = new Map<string, TypeFormResponseField>();
        for (const answer of item.answers) {
          responsePreprocessing.set(answer.field.id, answer);
        }

        return {
          response_id: item.response_id,
          firstName: responsePreprocessing.get("nfGel41KT3dP")?.text ?? "N/A",
          lastName: responsePreprocessing.get("mwP5oTr2JHgD")?.text ?? "N/A",
          birthday: new Date(
            responsePreprocessing.get("m7lNzS2BDhp1")?.date ?? "2000-01-01"
          ),
          major: responsePreprocessing.get("PzclVTL14dsF")?.text ?? "N/A",
          school: responsePreprocessing.get("63Wa2JCZ1N3R")?.text ?? "N/A",
          willBeEnrolled:
            responsePreprocessing.get("rG4lrpFoXXpL")?.boolean ?? false,
          graduationYear: new Date(
            responsePreprocessing.get("Ez47B6N0QzKY")?.date ?? "2000-01-01"
          ),
          degree: responsePreprocessing.get("035Ul4T9mldq")?.text ?? "N/A",
          currentLevel:
            responsePreprocessing.get("3SPBWlps2PBj")?.text ?? "N/A",
          hackathonCount:
            responsePreprocessing.get("MyObNZSNMZOZ")?.text ?? "N/A",
          longAnswer1: responsePreprocessing.get("rCIqmnIUzvAV")?.text ?? "N/A",
          longAnswer2: responsePreprocessing.get("h084NVJ0kEsO")?.text ?? "N/A",
          longAnswer3: responsePreprocessing.get("wq7KawPVuW4I")?.text ?? "N/A",
          socialLinks: responsePreprocessing.get("CE5WnCcBNEtj")?.text ?? "N/A",
          resume:
            responsePreprocessing
              .get("z8wTMK3lMO00")
              ?.file_url?.replace(
                "https://api.typeform.com/forms",
                "/api/resumes"
              ) ?? "N/A",
          extra: responsePreprocessing.get("GUpky3mnQ3q5")?.text ?? "N/A",
          tshirtSize: responsePreprocessing.get("Q9xv6pezGeSc")?.text ?? "N/A",
          hackerType: responsePreprocessing.get("k9BrMbznssVX")?.text ?? "N/A",
          hasTeam: responsePreprocessing.get("3h36sGge5G4X")?.boolean ?? false,
          workShop: responsePreprocessing.get("Q3MisVaz3Ukw")?.text ?? "N/A",
          gender: responsePreprocessing.get("b3sr6g16jGjj")?.text ?? "N/A",
          considerSponserChat:
            responsePreprocessing.get("LzF2H4Fjfwvq")?.boolean ?? false,
          howDidYouHear:
            responsePreprocessing.get("OoutsXd4RFcR")?.text ?? "N/A",
          background: responsePreprocessing.get("kGs2PWAnqBI3")?.text ?? "N/A",
          emergencyContactInfo: {
            firstName: responsePreprocessing.get("o5rMp5fj0BMa")?.text ?? "N/A",
            lastName: responsePreprocessing.get("irlsiZFKVJKD")?.text ?? "N/A",
            phoneNumber:
              responsePreprocessing.get("ceNTt9oUhO6Q")?.phone_number ?? "N/A",
            email: responsePreprocessing.get("onIT7bTImlRj")?.email ?? "N/A",
          },
          mlhAgreement:
            responsePreprocessing.get("F3vbQhObxXFa")?.boolean ?? false,
          mlhCoc: responsePreprocessing.get("f3ELfiV5gVSs")?.boolean ?? false,
          hackerId: mappedUsers.get(item.response_id)?.id ?? "N/A",
          reviews: mappedUsers.get(item.response_id)?.reviewer ?? [],
          email: mappedUsers.get(item.response_id)?.email ?? "N/A",
        };
      });
      // filter responses to get the ones that need review
      const output = converted.filter((item) =>
        mappedUsers.has(item.response_id)
      );

      return { data: output };
    },
  }) //get applications without enough reviews
  .query("getPriorityApplications", {
    async resolve({ ctx }) {
      if (
        !(
          ctx.session.user.role.includes("ADMIN") ||
          ctx.session.user.role.includes("REVIEWER")
        )
      ) {
        throw new trpc.TRPCError({ code: "UNAUTHORIZED" });
      }

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
            email: item.email,
          };
        })
        .filter((item) => item.typeform_response_id != undefined)
        .forEach((item) => mappedUsers.set(item.typeform_response_id, item));

      // "before" token removed, and "until" token added, ending just after 11:59 PM on Nov 11
      const url = `https://api.typeform.com/forms/MVo09hRB/responses?completed=true&page_size=1000&until=2022-11-12T05:00:00Z`;
      const res = await fetch(url, options);
      const data: TypeFormResponse = await res.json();

      // Convert from TypeFormResponse to TypeFormSubmission
      const converted: TypeFormSubmission[] = data.items.map((item) => {
        const responsePreprocessing = new Map<string, TypeFormResponseField>();
        for (const answer of item.answers) {
          responsePreprocessing.set(answer.field.id, answer);
        }

        return {
          response_id: item.response_id,
          firstName: responsePreprocessing.get("nfGel41KT3dP")?.text ?? "N/A",
          lastName: responsePreprocessing.get("mwP5oTr2JHgD")?.text ?? "N/A",
          birthday: new Date(
            responsePreprocessing.get("m7lNzS2BDhp1")?.date ?? "2000-01-01"
          ),
          major: responsePreprocessing.get("PzclVTL14dsF")?.text ?? "N/A",
          school: responsePreprocessing.get("63Wa2JCZ1N3R")?.text ?? "N/A",
          willBeEnrolled:
            responsePreprocessing.get("rG4lrpFoXXpL")?.boolean ?? false,
          graduationYear: new Date(
            responsePreprocessing.get("Ez47B6N0QzKY")?.date ?? "2000-01-01"
          ),
          degree: responsePreprocessing.get("035Ul4T9mldq")?.text ?? "N/A",
          currentLevel:
            responsePreprocessing.get("3SPBWlps2PBj")?.text ?? "N/A",
          hackathonCount:
            responsePreprocessing.get("MyObNZSNMZOZ")?.text ?? "N/A",
          longAnswer1: responsePreprocessing.get("rCIqmnIUzvAV")?.text ?? "N/A",
          longAnswer2: responsePreprocessing.get("h084NVJ0kEsO")?.text ?? "N/A",
          longAnswer3: responsePreprocessing.get("wq7KawPVuW4I")?.text ?? "N/A",
          socialLinks: responsePreprocessing.get("CE5WnCcBNEtj")?.text ?? "N/A",
          resume:
            responsePreprocessing
              .get("z8wTMK3lMO00")
              ?.file_url?.replace(
                "https://api.typeform.com/forms",
                "/api/resumes"
              ) ?? "N/A",
          extra: responsePreprocessing.get("GUpky3mnQ3q5")?.text ?? "N/A",
          tshirtSize: responsePreprocessing.get("Q9xv6pezGeSc")?.text ?? "N/A",
          hackerType: responsePreprocessing.get("k9BrMbznssVX")?.text ?? "N/A",
          hasTeam: responsePreprocessing.get("3h36sGge5G4X")?.boolean ?? false,
          workShop: responsePreprocessing.get("Q3MisVaz3Ukw")?.text ?? "N/A",
          gender: responsePreprocessing.get("b3sr6g16jGjj")?.text ?? "N/A",
          considerSponserChat:
            responsePreprocessing.get("LzF2H4Fjfwvq")?.boolean ?? false,
          howDidYouHear:
            responsePreprocessing.get("OoutsXd4RFcR")?.text ?? "N/A",
          background: responsePreprocessing.get("kGs2PWAnqBI3")?.text ?? "N/A",
          emergencyContactInfo: {
            firstName: responsePreprocessing.get("o5rMp5fj0BMa")?.text ?? "N/A",
            lastName: responsePreprocessing.get("irlsiZFKVJKD")?.text ?? "N/A",
            phoneNumber:
              responsePreprocessing.get("ceNTt9oUhO6Q")?.phone_number ?? "N/A",
            email: responsePreprocessing.get("onIT7bTImlRj")?.email ?? "N/A",
          },
          mlhAgreement:
            responsePreprocessing.get("F3vbQhObxXFa")?.boolean ?? false,
          mlhCoc: responsePreprocessing.get("f3ELfiV5gVSs")?.boolean ?? false,
          hackerId: mappedUsers.get(item.response_id)?.id ?? "N/A",
          reviews: mappedUsers.get(item.response_id)?.reviewer ?? [],
          email: mappedUsers.get(item.response_id)?.email ?? "N/A",
        };
      });
      // filter responses to get the ones that need review
      const output = converted.filter((item) =>
        mappedUsers.has(item.response_id)
      );

      return { data: output };
    },
  })
  .mutation("submit", {
    input: z.object({ mark: z.number(), hackerId: z.string() }),
    async resolve({ ctx, input }) {
      if (
        !(
          ctx.session.user.role.includes("ADMIN") ||
          ctx.session.user.role.includes("REVIEWER")
        )
      ) {
        throw new trpc.TRPCError({ code: "UNAUTHORIZED" });
      }

      // count reviews for a hacker.
      // if we have 3 already, deny making any more reviews
      const reviewCount = await ctx.prisma.review.count({
        where: {
          hackerId: input.hackerId,
        },
      });
      if (reviewCount >= 3) {
        throw new trpc.TRPCError({ code: "CONFLICT" });
      }

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
