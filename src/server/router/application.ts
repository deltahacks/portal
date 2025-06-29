import { Prisma, Status, Role } from "@prisma/client";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { env } from "../../env/server.mjs";
import { protectedProcedure, router } from "./trpc";
import applicationSchema from "../../schemas/application";
import dh11schema from "../../schemas/application";

const TypeFormSubmissionTruncated = z.object({
  response_id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  birthday: z.date(),
});

export type TypeFormSubmissionTruncated = z.infer<
  typeof TypeFormSubmissionTruncated
>;

const TypeFormSubmissionSocial = z.object({
  response_id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  school: z.string(),
  degree: z.string(),
  major: z.string(),
  currentLevel: z.string(),
  socialLinks: z.string().nullish(),
});

export type TypeFormSubmissionSocial = z.infer<typeof TypeFormSubmissionSocial>;

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

export type TypeFormResponseField = z.infer<typeof TypeFormResponseField>;

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
  }),
);

export type TypeFormResponseItems = z.infer<typeof TypeFormResponseItems>;

const TypeFormResponse = z.object({
  total_items: z.number(),
  page_count: z.number(),
  items: TypeFormResponseItems,
});

export type TypeFormResponse = z.infer<typeof TypeFormResponse>;

const StatusCount = z
  .object({
    status: z.nativeEnum(Status),
    count: z.number(),
  })
  .array();

const options = {
  method: "GET",
  headers: {
    Authorization: `Bearer ${env.TYPEFORM_API_KEY}`,
  },
};

// Example router with queries that can only be hit if the user requesting is signed in
export const applicationRouter = router({
  received: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma?.user.findFirst({
      where: { id: ctx.session.user.id },
    });

    if (!user) {
      return false;
    }
    if (
      user.typeform_response_id === undefined ||
      user.typeform_response_id === null
    ) {
      return false;
    }
    return true;
  }),
  getStatusCount: protectedProcedure
    .output(StatusCount)
    .query(async ({ ctx }) => {
      if (
        !(
          ctx.session.user.role.includes(Role.ADMIN) ||
          ctx.session.user.role.includes(Role.REVIEWER)
        )
      ) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const statusCount = (
        await ctx.prisma.dH11Application.groupBy({
          by: ["status"],
          _count: {
            status: true,
          },
        })
      ).map((val) => {
        return {
          status: val.status,
          count: val._count.status,
        };
      });

      const otherStatuses = new Set(Object.keys(Status) as Status[]);
      statusCount.forEach((val) => {
        otherStatuses.delete(val.status);
      });
      otherStatuses.forEach((status) => {
        statusCount.push({ status, count: 0 });
      });

      statusCount.sort((a, b) => {
        return a.status.localeCompare(b.status);
      });

      return StatusCount.parse(statusCount);
    }),
  status: protectedProcedure
    .output(z.nativeEnum(Status))
    .query(async ({ ctx }) => {
      const user = await ctx.prisma?.user.findFirst({
        where: { id: ctx.session.user.id },
        include: { DH11Application: true },
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (user.DH11Application === null || user.DH11Application === undefined) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return user.DH11Application.status;
    }),
  qr: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findFirst({
      where: { id: ctx.session.user.id },
    });
    const qr = user?.qrcode;

    return qr;
  }),
  rsvp: protectedProcedure
    .input(
      z.object({
        rsvpCheck: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma?.user.findFirst({
        where: { id: ctx.session.user.id },
        include: { DH11Application: true },
      });

      if (user?.DH11Application?.status != Status.ACCEPTED) {
        throw new Error("Unauthorized call");
      }

      await ctx.prisma?.dH11Application.update({
        where: { id: user.DH11Application?.id },
        data: { status: Status.RSVP, rsvpCheck: input.rsvpCheck },
      });

      await ctx.logsnag.track({
        channel: "rsvps",
        event: "RSVP Submitted",
        user_id: `${user.name} - ${user.email}`,
        description: `${user.name} has submitted their RSVP.`,
        icon: "🎉",
      });
      // await ctx.posthog.capture("RSVP Submitted", {
      //   user_id: `${user.name} - ${user.email}`,
      //   description: `${user.name} has submitted their RSVP.`,
      //   $set: {
      //     "RSVP Submitted": true,
      //   },
      // });
    }),
  submit: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          typeform_response_id: input.id,
        },
      });
    }),
  checkIn: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      // Ensure that user does not have a QR code already
      const user = await ctx.prisma.user.findFirst({
        where: { id: ctx.session.user.id },
      });

      if (user?.qrcode !== null) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are already checked in.",
        });
      }

      // Check if this was because there was a duplicate in the DB
      // this means this QR code is already registered to someone else
      const qrCount = await ctx.prisma.user.count({
        where: { qrcode: input },
      });

      if (qrCount != 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This QR code is already in use",
        });
      }

      // Actual Update
      await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          qrcode: input,
          status: Status.CHECKED_IN,
        },
      });
    }),
  socialInfo: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: { qrcode: input },
      });
      const url = `https://api.typeform.com/forms/MVo09hRB/responses?included_response_ids=${user?.typeform_response_id}`;
      const res = await fetch(url, options);
      const data: TypeFormResponse = await res.json();

      const converted: TypeFormSubmissionSocial[] = data.items.map((item) => {
        const responsePreprocessing = new Map<string, TypeFormResponseField>();
        for (const answer of item.answers) {
          responsePreprocessing.set(answer.field.id, answer);
        }

        return {
          response_id: item.response_id,
          firstName: responsePreprocessing.get("nfGel41KT3dP")?.text ?? "N/A",
          lastName: responsePreprocessing.get("mwP5oTr2JHgD")?.text ?? "N/A",
          school: responsePreprocessing.get("63Wa2JCZ1N3R")?.text ?? "N/A",
          degree: responsePreprocessing.get("035Ul4T9mldq")?.text ?? "N/A",
          currentLevel:
            responsePreprocessing.get("3SPBWlps2PBj")?.text ?? "N/A",
          socialLinks: responsePreprocessing.get("CE5WnCcBNEtj")?.text ?? "N/A",
          major: responsePreprocessing.get("PzclVTL14dsF")?.text ?? "N/A",
        };
      });
      const socialLinks = converted[0]?.socialLinks?.match(
        /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim,
      );

      return {
        ...converted[0],
        socialLinks: socialLinks,
        image: user?.image,
        role: user?.role,
      };
    }),
  getPrevAutofill: protectedProcedure
    .output(dh11schema.partial())
    .query(async ({ ctx }) => {
      // Get the current user's DH10 application
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        include: { dh10application: true },
      });

      if (!user || !user.dh10application) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No previous application found for autofill",
        });
      }

      const dh10App = user.dh10application;

      // Create the autofill object based on DH10 data
      const pt = dh11schema.partial();
      type AutofillType = z.infer<typeof pt>;
      const autofill: AutofillType = {
        firstName: dh10App.firstName,
        lastName: dh10App.lastName,
        birthday: dh10App.birthday,
        studyEnrolledPostSecondary: dh10App.studyEnrolledPostSecondary,
        studyLocation: dh10App.studyLocation,
        studyDegree: dh10App.studyDegree,
        studyMajor: dh10App.studyMajor,
        studyExpectedGraduation: dh10App.studyExpectedGraduation,
        interests: dh10App.interests,
        // linkToResume: dh10App.linkToResume,
        hackerKind: [dh10App.hackerKind], // Convert to array for DH11
        workshopChoices: dh10App.workshopChoices,
        discoverdFrom: dh10App.discoverdFrom,
        considerCoffee: dh10App.considerCoffee,
        gender: dh10App.gender,
        race: dh10App.race,
        emergencyContactName: dh10App.emergencyContactName,
        emergencyContactPhone: dh10App.emergencyContactPhone,
        emergencyContactRelation: dh10App.emergencyContactRelation,
      };

      // Handle fields that don't have a direct mapping
      if (dh10App.socialText) {
        autofill.socialText = [dh10App.socialText];
      }

      return autofill;
    }),
  // submitDh10: protectedProcedure
  //   .input(applicationSchema)
  //   .mutation(async ({ ctx, input }) => {

  //     // make sure there is no existing application

  //     try {
  //       let gradDate = null;
  //       if (input.studyExpectedGraduation) {
  //         const possible = new Date(input.studyExpectedGraduation);
  //         if (!isNaN(possible.getTime())) {
  //           gradDate = possible;
  //         }
  //       }

  //       await ctx.prisma.dH10Application.create({
  //         data: {
  //           ...input,
  //           birthday: new Date(input.birthday),
  //           studyExpectedGraduation: gradDate,
  //           User: { connect: { id: ctx.session.user.id } },
  //         },
  //       });
  //     } catch (e) {
  //       if (e instanceof Prisma.PrismaClientKnownRequestError) {
  //         if (e.code === "P2002")
  //           throw new TRPCError({
  //             code: "FORBIDDEN",
  //             message: "You have already submitted an application.",
  //           });
  //       }
  //     }

  //     const user = await ctx.prisma.user.update({
  //       where: { id: ctx.session.user.id },
  //       data: { status: Status.IN_REVIEW },
  //     });

  //     await ctx.logsnag.track({
  //       channel: "applications",
  //       event: "Application Submitted",
  //       user_id: `${user.name} - ${user.email}`,
  //       description: "A user has submitted an application.",
  //       icon: "📝",
  //     });
  //   }),
  submitDh11: protectedProcedure
    .input(applicationSchema)
    .mutation(async ({ ctx, input }) => {
      // aaaaaa
      try {
        let gradDate = null;
        if (input.studyExpectedGraduation) {
          const possible = new Date(input.studyExpectedGraduation);
          if (!isNaN(possible.getTime())) {
            gradDate = possible;
          }
        }

        await ctx.prisma.dH11Application.create({
          data: {
            ...input,
            birthday: new Date(input.birthday),
            studyExpectedGraduation: gradDate,

            User: { connect: { id: ctx.session.user.id } },
          },
        });

        const user = await ctx.prisma.user.update({
          where: { id: ctx.session.user.id },
          data: { status: Status.IN_REVIEW },
        });

        await ctx.logsnag.track({
          channel: "applications",
          event: "Application Submitted",
          user_id: `${user.name} - ${user.email}`,
          description: "A user has submitted an application.",
          icon: "📝",
        });

        await ctx.posthog.capture({
          distinctId: user.id,
          event: "user submitted application",
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002")
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You have already submitted an application.",
            });
        }
      }
    }),

  deleteApplication: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.prisma.user.findFirst({
      where: { id: ctx.session.user.id },
    });
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
    if (
      user.DH11ApplicationId === null ||
      user.DH11ApplicationId === undefined
    ) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
    try {
      await ctx.prisma.dH11Application.delete({
        where: { id: user.DH11ApplicationId },
      });
      await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: { status: Status.IN_REVIEW }, // Replace with the correct status
      });
      // create logsnag log
      await ctx.logsnag.track({
        channel: "applications",
        event: "Application Deleted",
        user_id: `${user.name} - ${user.email}`,
        description: "A user has deleted their application.",
        icon: "🗑️",
      });
      // await ctx.posthog.capture("Application Deleted", {
      //   user_id: `${user.name} - ${user.email}`,
      //   description: "A user has deleted their application.",
      //   $set: {
      //     "Application Deleted": true,
      //   },
      // });
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete the application.",
      });
    }
  }),
});
