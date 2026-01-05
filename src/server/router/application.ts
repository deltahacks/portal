import { Prisma, Status, Role } from "@prisma/client";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "./trpc";
import { dh12schema } from "../../schemas/application";

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
        await ctx.prisma.dH12Application.groupBy({
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
  status: protectedProcedure.output(z.enum(Status)).query(async ({ ctx }) => {
    const user = await ctx.prisma?.user.findFirst({
      where: { id: ctx.session.user.id },
      include: { DH12Application: true },
    });
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
    if (user.DH12Application === null || user.DH12Application === undefined) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return user.DH12Application.status;
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
        include: { DH12Application: true },
      });

      if (!user?.DH12Application?.id) {
        throw new Error("No DH12Application found for user");
      }

      if (user?.DH12Application?.status != Status.ACCEPTED) {
        throw new Error("Unauthorized call");
      }

      await ctx.prisma?.dH12Application.update({
        where: { id: user.DH12Application.id },
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
    .output(dh12schema.partial())
    .query(async ({ ctx }) => {
      // Get the current user's DH11 application
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        include: { DH11Application: true, dh10application: true },
      });

      if (!user || (!user.DH11Application && !user.dh10application)) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No previous application found for autofill",
        });
      }

      // TODO: We need to decide how we wanna keep this backward compatibility
      // since more items keep getting added here.
      const dh11App = user.DH11Application;
      const dh10App = user.dh10application;

      // Create the autofill object based on DH10 data
      const pt = dh12schema.partial();
      type AutofillType = z.infer<typeof pt>;
      const autofill: AutofillType = {
        firstName: dh11App?.firstName ?? dh10App?.firstName ?? undefined,
        lastName: dh11App?.lastName ?? dh10App?.lastName ?? undefined,
        birthday: dh11App?.birthday ?? dh10App?.birthday ?? undefined,
        studyEnrolledPostSecondary:
          dh11App?.studyEnrolledPostSecondary ??
          dh10App?.studyEnrolledPostSecondary,
        studyLocation: dh11App?.studyLocation ?? dh10App?.studyLocation,
        studyDegree: dh11App?.studyDegree ?? dh10App?.studyDegree,
        studyMajor: dh11App?.studyMajor ?? dh10App?.studyMajor,
        studyExpectedGraduation:
          dh11App?.studyExpectedGraduation ?? dh10App?.studyExpectedGraduation,
        interests: dh11App?.interests ?? dh10App?.interests,
        // linkToResume: dh10App.linkToResume,
        hackerKind: dh11App?.hackerKind ?? [],
        workshopChoices: dh11App?.workshopChoices ?? dh10App?.workshopChoices,
        discoverdFrom: dh11App?.discoverdFrom ?? dh10App?.discoverdFrom,
        considerCoffee: dh10App?.considerCoffee,
        gender: dh11App?.gender ?? dh10App?.gender,
        race: dh11App?.race ?? dh10App?.race,
        emergencyContactName:
          dh11App?.emergencyContactName ?? dh10App?.emergencyContactName,
        emergencyContactPhone:
          dh11App?.emergencyContactPhone ?? dh10App?.emergencyContactPhone,
        emergencyContactRelation:
          dh11App?.emergencyContactRelation ??
          dh10App?.emergencyContactRelation,
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

  submitDh12: protectedProcedure
    .input(dh12schema)
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
        await ctx.prisma.dH12Application.create({
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
      user.DH12ApplicationId === null ||
      user.DH12ApplicationId === undefined
    ) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
    try {
      await ctx.prisma.dH12Application.delete({
        where: { id: user.DH12ApplicationId },
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
