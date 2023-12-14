import { z } from "zod";
import { protectedProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { Role, Status } from "@prisma/client";
import ApplicationSchema from "../../schemas/application";
import {
  assert,
  assertHasRequiredRoles,
  assertWithTRPCError,
} from "../../utils/assertions";

const Application = z.object({
  id: z.string().cuid(),
  name: z.string(),
  email: z.string().email(),
  status: z.nativeEnum(Status),
  dh10application: ApplicationSchema,
});

export type Application = z.infer<typeof Application>;

export const reviewerRouter = router({
  getApplications: protectedProcedure
    .output(Application.array())
    .query(async ({ ctx }) => {
      assertHasRequiredRoles(ctx.session.user.role, [
        Role.ADMIN,
        Role.REVIEWER,
      ]);

      const users = await ctx.prisma.user.findMany({
        where: {
          dH10ApplicationId: {
            not: null,
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          dh10application: true,
        },
      });

      return Application.array().parse(users);
    }),
  // getPriorityApplications: protectedProcedure.query(async ({ ctx }) => {
  //   if (
  //     !(
  //       ctx.session.user.role.includes("ADMIN") ||
  //       ctx.session.user.role.includes("REVIEWER")
  //     )
  //   ) {
  //     throw new TRPCError({ code: "UNAUTHORIZED" });
  //   }

  //   // select all user and their review details joining user on review
  //   const dbdata = await ctx.prisma.user.findMany({
  //     include: {
  //       hacker: {
  //         select: {
  //           id: true,
  //           hacker: true,
  //           mark: true,
  //           reviewer: true,
  //         },
  //       },
  //     },
  //   });

  //   const mappedUsers = new Map();

  //   dbdata
  //     .map((item) => {
  //       return {
  //         typeform_response_id: item.typeform_response_id,
  //         reviewer: item.hacker,
  //         id: item.id,
  //         email: item.email,
  //       };
  //     })
  //     .filter((item) => item.typeform_response_id != undefined)
  //     .forEach((item) => mappedUsers.set(item.typeform_response_id, item));

  //   // "before" token removed, and "until" token added, ending just after 11:59 PM on Nov 11
  //   const url = `https://api.typeform.com/forms/MVo09hRB/responses?completed=true&page_size=1000&until=2022-11-12T05:00:00Z`;
  //   const res = await fetch(url, options);
  //   const data: TypeFormResponse = await res.json();

  //   // Convert from TypeFormResponse to TypeFormSubmission
  //   const converted: TypeFormSubmission[] = data.items.map((item) => {
  //     const responsePreprocessing = new Map<string, TypeFormResponseField>();
  //     for (const answer of item.answers) {
  //       responsePreprocessing.set(answer.field.id, answer);
  //     }

  //     return {
  //       response_id: item.response_id,
  //       firstName: responsePreprocessing.get("nfGel41KT3dP")?.text ?? "N/A",
  //       lastName: responsePreprocessing.get("mwP5oTr2JHgD")?.text ?? "N/A",
  //       birthday: new Date(
  //         responsePreprocessing.get("m7lNzS2BDhp1")?.date ?? "2000-01-01"
  //       ),
  //       major: responsePreprocessing.get("PzclVTL14dsF")?.text ?? "N/A",
  //       school: responsePreprocessing.get("63Wa2JCZ1N3R")?.text ?? "N/A",
  //       willBeEnrolled:
  //         responsePreprocessing.get("rG4lrpFoXXpL")?.boolean ?? false,
  //       graduationYear: new Date(
  //         responsePreprocessing.get("Ez47B6N0QzKY")?.date ?? "2000-01-01"
  //       ),
  //       degree: responsePreprocessing.get("035Ul4T9mldq")?.text ?? "N/A",
  //       currentLevel: responsePreprocessing.get("3SPBWlps2PBj")?.text ?? "N/A",
  //       hackathonCount:
  //         responsePreprocessing.get("MyObNZSNMZOZ")?.text ?? "N/A",
  //       longAnswer1: responsePreprocessing.get("rCIqmnIUzvAV")?.text ?? "N/A",
  //       longAnswer2: responsePreprocessing.get("h084NVJ0kEsO")?.text ?? "N/A",
  //       longAnswer3: responsePreprocessing.get("wq7KawPVuW4I")?.text ?? "N/A",
  //       socialLinks: responsePreprocessing.get("CE5WnCcBNEtj")?.text ?? "N/A",
  //       resume:
  //         responsePreprocessing
  //           .get("z8wTMK3lMO00")
  //           ?.file_url?.replace(
  //             "https://api.typeform.com/forms",
  //             "/api/resumes"
  //           ) ?? "N/A",
  //       extra: responsePreprocessing.get("GUpky3mnQ3q5")?.text ?? "N/A",
  //       tshirtSize: responsePreprocessing.get("Q9xv6pezGeSc")?.text ?? "N/A",
  //       hackerType: responsePreprocessing.get("k9BrMbznssVX")?.text ?? "N/A",
  //       hasTeam: responsePreprocessing.get("3h36sGge5G4X")?.boolean ?? false,
  //       workShop: responsePreprocessing.get("Q3MisVaz3Ukw")?.text ?? "N/A",
  //       gender: responsePreprocessing.get("b3sr6g16jGjj")?.text ?? "N/A",
  //       considerSponserChat:
  //         responsePreprocessing.get("LzF2H4Fjfwvq")?.boolean ?? false,
  //       howDidYouHear: responsePreprocessing.get("OoutsXd4RFcR")?.text ?? "N/A",
  //       background: responsePreprocessing.get("kGs2PWAnqBI3")?.text ?? "N/A",
  //       emergencyContactInfo: {
  //         firstName: responsePreprocessing.get("o5rMp5fj0BMa")?.text ?? "N/A",
  //         lastName: responsePreprocessing.get("irlsiZFKVJKD")?.text ?? "N/A",
  //         phoneNumber:
  //           responsePreprocessing.get("ceNTt9oUhO6Q")?.phone_number ?? "N/A",
  //         email: responsePreprocessing.get("onIT7bTImlRj")?.email ?? "N/A",
  //       },
  //       mlhAgreement:
  //         responsePreprocessing.get("F3vbQhObxXFa")?.boolean ?? false,
  //       mlhCoc: responsePreprocessing.get("f3ELfiV5gVSs")?.boolean ?? false,
  //       hackerId: mappedUsers.get(item.response_id)?.id ?? "N/A",
  //       reviews: mappedUsers.get(item.response_id)?.reviewer ?? [],
  //       email: mappedUsers.get(item.response_id)?.email ?? "N/A",
  //     };
  //   });
  //   // filter responses to get the ones that need review
  //   const output = converted.filter((item) =>
  //     mappedUsers.has(item.response_id)
  //   );

  //   return { data: output };
  // }),
  submit: protectedProcedure
    .input(z.object({ mark: z.number(), hackerId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (
        !(
          ctx.session.user.role.includes(Role.ADMIN) ||
          ctx.session.user.role.includes(Role.REVIEWER)
        )
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // count reviews for a hacker.
      // if we have 3 already, deny making any more reviews
      const reviewCount = await ctx.prisma.review.count({
        where: {
          hackerId: input.hackerId,
        },
      });
      assertWithTRPCError(reviewCount >= 3, "CONFLICT");

      const res = await ctx.prisma.review.findFirst({
        where: {
          hackerId: input.hackerId,
          reviewerId: ctx.session.user.id,
        },
      });
      assert(!!res, "Duplicate Review");

      await ctx.prisma.review.create({
        data: {
          hackerId: input.hackerId,
          reviewerId: ctx.session.user.id,
          mark: input.mark,
        },
      });
    }),
});
