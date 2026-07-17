import { Prisma, Status, Role } from "@prisma/client";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./trpc";
import { dh13schema } from "../../schemas/application";

const StatusCount = z
  .object({
    status: z.enum(Status),
    count: z.number(),
  })
  .array();

export const applicationRouter = router({
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
        await ctx.prisma.dH13Application.groupBy({
          by: ["status"],
          where: {
            User: { isNot: null },
          },
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
  status: protectedProcedure.output(z.enum(Status)).query(async ({ ctx }) => {
    const user = await ctx.prisma?.user.findFirst({
      where: { id: ctx.session.user.id },
      include: { DH13Application: true },
    });
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
    if (user.DH13Application === null || user.DH13Application === undefined) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return user.DH13Application.status;
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
        dietaryRestrictions: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma?.user.findFirst({
        where: { id: ctx.session.user.id },
        include: { DH13Application: true },
      });

      if (!user?.DH13Application?.id) {
        throw new Error("No DH13Application found for user");
      }

      if (user?.DH13Application?.status != Status.ACCEPTED) {
        throw new Error("Unauthorized call");
      }

      await ctx.prisma?.dH13Application.update({
        where: { id: user.DH13Application.id },
        data: {
          status: Status.RSVP,
          rsvpCheck: input.rsvpCheck,
          dietaryRestrictions: input.dietaryRestrictions,
        },
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

  checkIn: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      // TODO: update logic for new qr code system
    }),

  getPrevAutofill: protectedProcedure
    .output(dh13schema.partial())
    .query(async ({ ctx }) => {
      // Get the current user's previous-year application (DH12, falling back to DH11)
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        include: { DH12Application: true, DH11Application: true },
      });

      if (!user || (!user.DH12Application && !user.DH11Application)) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No previous application found for autofill",
        });
      }

      const dh12App = user.DH12Application;
      const dh11App = user.DH11Application;

      // Create the autofill object from the previous year's application
      const pt = dh13schema.partial();
      type AutofillType = z.infer<typeof pt>;
      const autofill: AutofillType = {
        firstName: dh12App?.firstName ?? dh11App?.firstName ?? undefined,
        lastName: dh12App?.lastName ?? dh11App?.lastName ?? undefined,
        birthday: dh12App?.birthday ?? dh11App?.birthday ?? undefined,
        studyEnrolledPostSecondary:
          dh12App?.studyEnrolledPostSecondary ??
          dh11App?.studyEnrolledPostSecondary,
        studyLocation: dh12App?.studyLocation ?? dh11App?.studyLocation,
        studyDegree: dh12App?.studyDegree ?? dh11App?.studyDegree,
        studyMajor: dh12App?.studyMajor ?? dh11App?.studyMajor,
        studyExpectedGraduation:
          dh12App?.studyExpectedGraduation ?? dh11App?.studyExpectedGraduation,
        interests: dh12App?.interests ?? dh11App?.interests,
        // linkToResume: dh12App?.linkToResume,
        hackerKind: dh12App?.hackerKind ?? dh11App?.hackerKind ?? [],
        workshopChoices: dh12App?.workshopChoices ?? dh11App?.workshopChoices,
        discoverdFrom: dh12App?.discoverdFrom ?? dh11App?.discoverdFrom,
        considerCoffee: dh12App?.considerCoffee ?? dh11App?.considerCoffee,
        gender: dh12App?.gender ?? dh11App?.gender,
        race: dh12App?.race ?? dh11App?.race,
        emergencyContactName:
          dh12App?.emergencyContactName ?? dh11App?.emergencyContactName,
        emergencyContactPhone:
          dh12App?.emergencyContactPhone ?? dh11App?.emergencyContactPhone,
        emergencyContactRelation:
          dh12App?.emergencyContactRelation ??
          dh11App?.emergencyContactRelation,
      };

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
  // submitDh11: protectedProcedure
  //   .input(applicationSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     // aaaaaa
  //     try {
  //       let gradDate = null;
  //       if (input.studyExpectedGraduation) {
  //         const possible = new Date(input.studyExpectedGraduation);
  //         if (!isNaN(possible.getTime())) {
  //           gradDate = possible;
  //         }
  //       }

  //       await ctx.prisma.dH11Application.create({
  //         data: {
  //           ...input,
  //           birthday: new Date(input.birthday),
  //           studyExpectedGraduation: gradDate,

  //           User: { connect: { id: ctx.session.user.id } },
  //         },
  //       });

  //       const user = await ctx.prisma.user.update({
  //         where: { id: ctx.session.user.id },
  //         data: { status: Status.IN_REVIEW },
  //       });

  //       await ctx.logsnag.track({
  //         channel: "applications",
  //         event: "Application Submitted",
  //         user_id: `${user.name} - ${user.email}`,
  //         description: "A user has submitted an application.",
  //         icon: "📝",
  //       });

  //       await ctx.posthog.capture({
  //         distinctId: user.id,
  //         event: "user submitted application",
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
  //   }),

  // submitDh12: protectedProcedure
  //   .input(dh12schema)
  //   .mutation(async ({ input, ctx }) => {
  //     const user = await ctx.prisma.user.findFirst({
  //       where: { id: ctx.session.user.id },
  //     });
  //     if (!user) {
  //       throw new TRPCError({ code: "NOT_FOUND" });
  //     }
  //     try {
  //       let gradDate = null;
  //       if (input.studyExpectedGraduation) {
  //         const possible = new Date(input.studyExpectedGraduation);
  //         if (!isNaN(possible.getTime())) {
  //           gradDate = possible;
  //         }
  //       }
  //       await ctx.prisma.dH12Application.create({
  //         data: {
  //           ...input,
  //           birthday: new Date(input.birthday),
  //           studyExpectedGraduation: gradDate,

  //           User: { connect: { id: ctx.session.user.id } },
  //         },
  //       });

  //       await ctx.logsnag.track({
  //         channel: "applications",
  //         event: "Application Submitted",
  //         user_id: `${user.name} - ${user.email}`,
  //         description: "A user has submitted an application.",
  //         icon: "📝",
  //       });

  //       await ctx.posthog.capture({
  //         distinctId: user.id,
  //         event: "user submitted application",
  //       });
  //     } catch (e) {
  //       if (e instanceof Prisma.PrismaClientKnownRequestError) {
  //         if (e.code === "P2002")
  //           throw new TRPCError({
  //             code: "FORBIDDEN",
  //             message: "You have already submitted an application.",
  //           });
  //       }
  //       throw e;
  //     }
  //   }),

  submitDh13: protectedProcedure
    .input(dh13schema)
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findFirst({
        where: { id: ctx.session.user.id },
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      try {
        let gradDate = null;
        if (input.studyExpectedGraduation) {
          const possible = new Date(input.studyExpectedGraduation);
          if (!isNaN(possible.getTime())) {
            gradDate = possible;
          }
        }
        await ctx.prisma.dH13Application.create({
          data: {
            ...input,
            birthday: new Date(input.birthday),
            studyExpectedGraduation: gradDate,

            User: { connect: { id: ctx.session.user.id } },
          },
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
        throw e;
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
      user.DH13ApplicationId === null ||
      user.DH13ApplicationId === undefined
    ) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
    try {
      await ctx.prisma.dH13Application.delete({
        where: { id: user.DH13ApplicationId },
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

  getWifiConfig: protectedProcedure.query(async ({ ctx }) => {
    const config = await ctx.prisma.config.findUnique({
      where: { name: "wifiConfig" },
    });

    if (!config) {
      return null;
    }

    return JSON.parse(config.value) as { name: string; password: string };
  }),
});
