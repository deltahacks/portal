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
  })
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
        await ctx.prisma.dH12Application.groupBy({ // Changed to dH12Application
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
        include: { DH11Application: true, DH12Application: true }, // Include both
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (user.DH12Application) {
        return user.DH12Application.status;
      } else if (user.DH11Application) {
        return user.DH11Application.status;
      } else {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No application found for the user.",
        });
      }
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
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma?.user.findFirst({
        where: { id: ctx.session.user.id },
        include: { DH11Application: true, DH12Application: true }, // Include both
      });

      let targetApplicationId: string | undefined;
      let targetApplicationName = "";

      if (user?.DH12Application?.status === Status.ACCEPTED) {
        targetApplicationId = user.DH12Application.id;
        targetApplicationName = "DH12Application";
      } else if (user?.DH11Application?.status === Status.ACCEPTED) {
        targetApplicationId = user.DH11Application.id;
        targetApplicationName = "DH11Application";
      }

      if (!targetApplicationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No application found in ACCEPTED state to RSVP for.",
        });
      }

      if (targetApplicationName === "DH12Application") {
        await ctx.prisma?.dH12Application.update({
          where: { id: targetApplicationId },
          data: { status: Status.RSVP, rsvpCheck: input.rsvpCheck },
        });
      } else if (targetApplicationName === "DH11Application") {
        await ctx.prisma?.dH11Application.update({
          where: { id: targetApplicationId },
          data: { status: Status.RSVP, rsvpCheck: input.rsvpCheck },
        });
      }

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
        /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim
      );

      return {
        ...converted[0],
        socialLinks: socialLinks,
        image: user?.image,
        role: user?.role,
      };
    }),
  getPrevAutofill: protectedProcedure
    .output(applicationSchema.partial()) // Use the generic applicationSchema
    .query(async ({ ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        include: { dh10application: true, DH11Application: true }, // Fetch both DH10 and DH11
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found.",
        });
      }

      const pt = applicationSchema.partial();
      type AutofillType = z.infer<typeof pt>;
      let autofill: AutofillType = {};

      if (user.DH11Application) {
        const dh11App = user.DH11Application;
        autofill = {
          firstName: dh11App.firstName,
          lastName: dh11App.lastName,
          phone: dh11App.phone,
          country: dh11App.country,
          birthday: dh11App.birthday,
          studyEnrolledPostSecondary: dh11App.studyEnrolledPostSecondary,
          studyLocation: dh11App.studyLocation,
          studyDegree: dh11App.studyDegree,
          studyMajor: dh11App.studyMajor,
          studyYearOfStudy: dh11App.studyYearOfStudy,
          studyExpectedGraduation: dh11App.studyExpectedGraduation,
          previousHackathonsCount: dh11App.previousHackathonsCount,
          longAnswerIncident: dh11App.longAnswerIncident,
          longAnswerGoals: dh11App.longAnswerGoals,
          longAnswerFood: dh11App.longAnswerFood,
          longAnswerTravel: dh11App.longAnswerTravel,
          longAnswerSocratica: dh11App.longAnswerSocratica,
          socialText: dh11App.socialText,
          interests: dh11App.interests,
          // linkToResume: dh11App.linkToResume, // Usually not auto-filled for privacy/staleness
          tshirtSize: dh11App.tshirtSize,
          hackerKind: dh11App.hackerKind,
          alreadyHaveTeam: dh11App.alreadyHaveTeam,
          workshopChoices: dh11App.workshopChoices,
          discoverdFrom: dh11App.discoverdFrom,
          considerCoffee: dh11App.considerCoffee,
          dietaryRestrictions: dh11App.dietaryRestrictions,
          underrepresented: dh11App.underrepresented,
          gender: dh11App.gender,
          race: dh11App.race,
          orientation: dh11App.orientation,
          emergencyContactName: dh11App.emergencyContactName,
          emergencyContactPhone: dh11App.emergencyContactPhone,
          emergencyContactRelation: dh11App.emergencyContactRelation,
          // MLH consent fields are usually not auto-filled as they need explicit re-consent
        };
      } else if (user.dh10application) {
        const dh10App = user.dh10application;
        autofill = {
          firstName: dh10App.firstName,
          lastName: dh10App.lastName,
          birthday: dh10App.birthday,
          studyEnrolledPostSecondary: dh10App.studyEnrolledPostSecondary,
          studyLocation: dh10App.studyLocation,
          studyDegree: dh10App.studyDegree,
          studyMajor: dh10App.studyMajor,
          studyExpectedGraduation: dh10App.studyExpectedGraduation,
          interests: dh10App.interests,
          hackerKind: dh10App.hackerKind ? [dh10App.hackerKind] : [], // DH10 was single string, DH11/12 is string array
          workshopChoices: dh10App.workshopChoices,
          discoverdFrom: dh10App.discoverdFrom,
          considerCoffee: dh10App.considerCoffee,
          gender: dh10App.gender,
          race: dh10App.race,
          emergencyContactName: dh10App.emergencyContactName,
          emergencyContactPhone: dh10App.emergencyContactPhone,
          emergencyContactRelation: dh10App.emergencyContactRelation,
          socialText: dh10App.socialText ? [dh10App.socialText] : [], // DH10 was single string
          // Fields not in DH10 will be undefined and thus not auto-filled
        };
      } else {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No previous application found for autofill.",
        });
      }
      return pt.parse(autofill); // Ensure the output matches the schema
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
          event: "Application Submitted", // This is generic, could be specified as DH11
          user_id: `${user.name} - ${user.email}`,
          description: "A user has submitted a DH11 application.",
          icon: "📝",
        });

        await ctx.posthog.capture({
          distinctId: user.id,
          event: "user submitted dh11 application",
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002")
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You have already submitted a DH11 application.",
            });
        }
        throw e;
      }
    }),
  submitDh12: protectedProcedure // New mutation for DH12
    .input(applicationSchema) // Assuming applicationSchema is generic for DH11/DH12 structure
    .mutation(async ({ ctx, input }) => {
      try {
        let gradDate = null;
        if (input.studyExpectedGraduation) {
          const possible = new Date(input.studyExpectedGraduation);
          if (!isNaN(possible.getTime())) {
            gradDate = possible;
          }
        }

        // Ensure user does not have a DH12 application already
        const existingUser = await ctx.prisma.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { DH12ApplicationId: true }
        });

        if (existingUser?.DH12ApplicationId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You have already submitted a DeltaHacks 12 application.",
          });
        }

        await ctx.prisma.dH12Application.create({ // Create DH12Application
          data: {
            ...input,
            birthday: new Date(input.birthday),
            studyExpectedGraduation: gradDate,
            User: { connect: { id: ctx.session.user.id } }, // Connects to User.DH12ApplicationId
          },
        });

        const user = await ctx.prisma.user.update({
          where: { id: ctx.session.user.id },
          data: { status: Status.IN_REVIEW }, // Set user status; might need review if status is per-application
        });

        await ctx.logsnag.track({
          channel: "applications",
          event: "DH12 Application Submitted",
          user_id: `${user.name} - ${user.email}`,
          description: "A user has submitted a DH12 application.",
          icon: "📝",
        });

        await ctx.posthog.capture({
          distinctId: user.id,
          event: "user submitted dh12 application",
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === "P2002") 
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You have already submitted a DH12 application or there was a conflict.",
            });
        }
        throw e; 
      }
    }),

  deleteApplication: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({ // Use findUnique for clarity
      where: { id: ctx.session.user.id },
      select: { id: true, name: true, email: true, DH11ApplicationId: true, DH12ApplicationId: true },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
    }

    let appToDeleteId: string | null = null;
    let appType: "DH11" | "DH12" | null = null;
    let userUpdateData: Prisma.UserUpdateInput = {};

    if (user.DH12ApplicationId) {
      appToDeleteId = user.DH12ApplicationId;
      appType = "DH12";
      userUpdateData = { DH12ApplicationId: null, status: Status.IN_REVIEW }; // Reset status, or handle more gracefully
    } else if (user.DH11ApplicationId) {
      appToDeleteId = user.DH11ApplicationId;
      appType = "DH11";
      userUpdateData = { DH11ApplicationId: null, status: Status.IN_REVIEW }; // Reset status
    }

    if (!appToDeleteId || !appType) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No application found to delete for the user.",
      });
    }

    try {
      if (appType === "DH12") {
        await ctx.prisma.dH12Application.delete({
          where: { id: appToDeleteId },
        });
      } else if (appType === "DH11") {
        await ctx.prisma.dH11Application.delete({
          where: { id: appToDeleteId },
        });
      }

      await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: userUpdateData,
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
