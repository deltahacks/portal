import { z } from "zod";
import { createProtectedRouter } from "./context";
import { env } from "../../env/server.mjs";
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

const TypeFormResponse = z.object({
  total_items: z.number(),
  page_count: z.number(),
  items: z.array(
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
  ),
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

interface IMappedUser {
  typeform_response_id: string;
  reviewer: IReviewer[];
  id: string;
  email: string;
  name: string;
}

interface IReviewer {
  id: string;
  hacker: {
    id: string;
    hacker: boolean;
    mark: number;
    reviewer: string;
  };
  mark: number;
  reviewer: string;
}

type TypeFormSubmission = z.infer<typeof TypeFormSubmission>;

const options = {
  method: "GET",
  headers: {
    Authorization: `Bearer ${env.TYPEFORM_API_KEY}`,
  },
};

export const reviewerRouter = createProtectedRouter()
  // get emails for applications
  .query("getAcceptedEmails", {
    async resolve({ ctx }) {
      const emails: {
        acceptedPriority: string[][];
        acceptedGeneral: string[][];
        waitlisted: string[][];
        rejected: string[][];
      } = {
        acceptedPriority: [],
        acceptedGeneral: [],
        waitlisted: [],
        rejected: [],
      };
      if (
        !(
          ctx.session.user.role.includes("ADMIN") ||
          ctx.session.user.role.includes("REVIEWER")
        )
      ) {
        throw new trpc.TRPCError({ code: "UNAUTHORIZED" });
      }

      const tdbdata = await ctx.prisma.user.findMany({
        select: {
          name: true,
          email: true,
          typeform_response_id: true,
          id: true,
          hacker: {
            select: {
              id: true,
              hacker: true,
              mark: true,
            },
          },
        },
      });

      const dbdata = tdbdata.map((e: any) => {
        return { ...e };
      });

      const mappedUsers = new Map();

      dbdata
        .map((item) => {
          return {
            name: item.name,
            typeform_response_id: item.typeform_response_id,
            reviewer: item.hacker,
            id: item.id,
            email: item.email,
          };
        })
        .map((e) => {
          return e;
        })
        .filter((item) => item.typeform_response_id != undefined)
        .forEach((item) => mappedUsers.set(item.typeform_response_id, item));

      const prioURL = `https://api.typeform.com/forms/MVo09hRB/responses?completed=true&page_size=1000&until=2022-11-12T05:00:00Z`;
      const priorityRes = await fetch(prioURL, options);
      const priorityResponses: TypeFormResponse = await priorityRes.json();
      //get array of response_ids from priority responses
      const priorityResponseIds = priorityResponses.items.map(
        (item) => item.response_id
      );

      const allURL = `https://api.typeform.com/forms/MVo09hRB/responses?completed=true&page_size=1000&since=2022-11-12T05:00:00Z`;
      const allRes = await fetch(allURL, options);
      const allResponses: TypeFormResponse = await allRes.json();
      //add response_ids from all responses if they are not in priority response_ids
      let allResponseIds = allResponses.items.map((item) => item.response_id);

      //adding all the accepted priority emails
      mappedUsers.forEach((value: IMappedUser, key: string) => {
        const average = value.reviewer.reduce((a, b) => a + b.mark, 0) / 3;
        if (
          priorityResponseIds.includes(value.typeform_response_id) &&
          average >= 3
        ) {
          emails.acceptedPriority.push([value.email, value.name]);
          priorityResponseIds.splice(
            priorityResponseIds.indexOf(value.typeform_response_id),
            1
          );
        }
      });

      //adding all the accepted general emails with the remaining priority responses
      allResponseIds = allResponseIds.concat(priorityResponseIds); //818
      mappedUsers.forEach((value: IMappedUser, key: string) => {
        const average = value.reviewer.reduce((a, b) => a + b.mark, 0) / 3;
        if (
          allResponseIds.includes(value.typeform_response_id) &&
          average >= 3
        ) {
          emails.acceptedGeneral.push([value.email, value.name]);
          allResponseIds.splice(
            allResponseIds.indexOf(value.typeform_response_id),
            1
          );
        }
      });

      //adding all the waitlisted emails
      mappedUsers.forEach((value: IMappedUser, key: string) => {
        const average = value.reviewer.reduce((a, b) => a + b.mark, 0) / 3;
        if (
          allResponseIds.includes(value.typeform_response_id) &&
          average >= 2.32
        ) {
          emails.waitlisted.push([value.email, value.name]);
          allResponseIds.splice(
            allResponseIds.indexOf(value.typeform_response_id),
            1
          );
        }
      });

      //adding all the rejected emails
      allResponseIds.forEach((responseId) => {
        const email: string = mappedUsers.get(responseId)?.email;
        const name: string = mappedUsers.get(responseId)?.name;
        emails.rejected.push([email, name, responseId]);
      });
      ``;

      return { data: emails };
    },
  })
  //get applications without enough reviews
  .query("getApplications", {
    async resolve({ ctx, input }) {
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

      const url = `https://api.typeform.com/forms/MVo09hRB/responses?completed=true&page_size=1000`;
      const res = await fetch(url, options);
      const data: TypeFormResponse = await res.json();

      // Convert from TypeFormResponse to TypeFormSubmission
      const converted: TypeFormSubmission[] = data.items.map((item) => {
        const responsePreprocessing: any = new Map();
        for (const answer of item.answers) {
          responsePreprocessing.set(answer.field.id, answer);
        }
        return {
          response_id: item.response_id,
          firstName: responsePreprocessing.get("nfGel41KT3dP").text!,
          lastName: responsePreprocessing.get("mwP5oTr2JHgD").text!,
          birthday: new Date(responsePreprocessing.get("m7lNzS2BDhp1").date!),
          major: responsePreprocessing.get("PzclVTL14dsF").text!,
          school: responsePreprocessing.get("63Wa2JCZ1N3R").text!,
          willBeEnrolled: responsePreprocessing.get("rG4lrpFoXXpL").boolean!,
          graduationYear: new Date(
            responsePreprocessing.get("Ez47B6N0QzKY").date!
          ),
          degree: responsePreprocessing.get("035Ul4T9mldq").text!,
          currentLevel: responsePreprocessing.get("3SPBWlps2PBj").text!,
          hackathonCount: responsePreprocessing.get("MyObNZSNMZOZ").text!,
          longAnswer1: responsePreprocessing.get("rCIqmnIUzvAV").text!,
          longAnswer2: responsePreprocessing.get("h084NVJ0kEsO").text!,
          longAnswer3: responsePreprocessing.get("wq7KawPVuW4I").text!,
          socialLinks: responsePreprocessing.get("CE5WnCcBNEtj")?.text,
          resume: responsePreprocessing
            .get("z8wTMK3lMO00")
            ?.file_url?.replace(
              "https://api.typeform.com/forms",
              "/api/resumes"
            ),
          extra: responsePreprocessing.get("GUpky3mnQ3q5")?.text,
          tshirtSize: responsePreprocessing.get("Q9xv6pezGeSc").text!,
          hackerType: responsePreprocessing.get("k9BrMbznssVX").text!,
          hasTeam: responsePreprocessing.get("3h36sGge5G4X").boolean!,
          workShop: responsePreprocessing.get("Q3MisVaz3Ukw")?.text,
          gender: responsePreprocessing.get("b3sr6g16jGjj").text!,
          considerSponserChat:
            responsePreprocessing.get("LzF2H4Fjfwvq")?.boolean,
          howDidYouHear: responsePreprocessing.get("OoutsXd4RFcR").text!,
          background: responsePreprocessing.get("kGs2PWAnqBI3").text!,
          emergencyContactInfo: {
            firstName: responsePreprocessing.get("o5rMp5fj0BMa").text!,
            lastName: responsePreprocessing.get("irlsiZFKVJKD").text!,
            phoneNumber:
              responsePreprocessing.get("ceNTt9oUhO6Q").phone_number!,
            email: responsePreprocessing.get("onIT7bTImlRj")?.email,
          },
          mlhAgreement: responsePreprocessing.get("F3vbQhObxXFa").boolean!,
          mlhCoc: responsePreprocessing.get("f3ELfiV5gVSs").boolean!,
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
            email: mappedUsers.get(item.response_id).email,
          };
        });

      return { data: output };
    },
  }) //get applications without enough reviews
  .query("getPriorityApplications", {
    async resolve({ ctx, input }) {
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
        const responsePreprocessing: any = new Map();
        for (const answer of item.answers) {
          responsePreprocessing.set(answer.field.id, answer);
        }
        return {
          response_id: item.response_id,
          firstName: responsePreprocessing.get("nfGel41KT3dP").text!,
          lastName: responsePreprocessing.get("mwP5oTr2JHgD").text!,
          birthday: new Date(responsePreprocessing.get("m7lNzS2BDhp1").date!),
          major: responsePreprocessing.get("PzclVTL14dsF").text!,
          school: responsePreprocessing.get("63Wa2JCZ1N3R").text!,
          willBeEnrolled: responsePreprocessing.get("rG4lrpFoXXpL").boolean!,
          graduationYear: new Date(
            responsePreprocessing.get("Ez47B6N0QzKY").date!
          ),
          degree: responsePreprocessing.get("035Ul4T9mldq").text!,
          currentLevel: responsePreprocessing.get("3SPBWlps2PBj").text!,
          hackathonCount: responsePreprocessing.get("MyObNZSNMZOZ").text!,
          longAnswer1: responsePreprocessing.get("rCIqmnIUzvAV").text!,
          longAnswer2: responsePreprocessing.get("h084NVJ0kEsO").text!,
          longAnswer3: responsePreprocessing.get("wq7KawPVuW4I").text!,
          socialLinks: responsePreprocessing.get("CE5WnCcBNEtj")?.text,
          resume: responsePreprocessing
            .get("z8wTMK3lMO00")
            ?.file_url?.replace(
              "https://api.typeform.com/forms",
              "/api/resumes"
            ),
          extra: responsePreprocessing.get("GUpky3mnQ3q5")?.text,
          tshirtSize: responsePreprocessing.get("Q9xv6pezGeSc").text!,
          hackerType: responsePreprocessing.get("k9BrMbznssVX").text!,
          hasTeam: responsePreprocessing.get("3h36sGge5G4X").boolean!,
          workShop: responsePreprocessing.get("Q3MisVaz3Ukw")?.text,
          gender: responsePreprocessing.get("b3sr6g16jGjj").text!,
          considerSponserChat:
            responsePreprocessing.get("LzF2H4Fjfwvq")?.boolean,
          howDidYouHear: responsePreprocessing.get("OoutsXd4RFcR").text!,
          background: responsePreprocessing.get("kGs2PWAnqBI3").text!,
          emergencyContactInfo: {
            firstName: responsePreprocessing.get("o5rMp5fj0BMa").text!,
            lastName: responsePreprocessing.get("irlsiZFKVJKD").text!,
            phoneNumber:
              responsePreprocessing.get("ceNTt9oUhO6Q").phone_number!,
            email: responsePreprocessing.get("onIT7bTImlRj")?.email,
          },
          mlhAgreement: responsePreprocessing.get("F3vbQhObxXFa").boolean!,
          mlhCoc: responsePreprocessing.get("f3ELfiV5gVSs").boolean!,
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
            email: mappedUsers.get(item.response_id).email,
          };
        });

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
