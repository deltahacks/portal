import { Status, Role, FormSubmission } from "@prisma/client";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { env } from "../../env/server.mjs";
import { protectedProcedure, router } from "./trpc";
import applicationSchema from "../../schemas/application";
import * as Config from "../db/configQueries";
import { trpcAssert } from "../../utils/asserts";

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

interface AnswerForRouter {
  statement: string | null;
  addressedQuestionId: string;
}

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
  getStatusCount: protectedProcedure
    .output(StatusCount)
    .query(async ({ ctx }) => {
      trpcAssert(
        ctx.session.user.role.includes(Role.ADMIN) ||
          ctx.session.user.role.includes(Role.REVIEWER),
        "UNAUTHORIZED"
      );

      const formName = await Config.getDeltaHacksApplicationFormName(
        ctx.prisma
      );

      if (!formName) {
        return [];
      }

      const statusCount = (
        await ctx.prisma.formSubmission.groupBy({
          by: ["status"],
          where: {
            formStructureId: formName,
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
  qr: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findFirst({
      where: { id: ctx.session.user.id },
    });
    const qr = user?.qrcode;

    return qr;
  }),
  rsvp: protectedProcedure.mutation(async ({ ctx }) => {
    const formName = await Config.getDeltaHacksApplicationFormName(ctx.prisma);
    trpcAssert(
      formName,
      "NOT_FOUND",
      "No application found for the User to RSVP"
    );

    const form = await ctx.prisma?.formSubmission.findFirst({
      where: { submitterId: ctx.session.user.id, formStructureId: formName },
    });

    trpcAssert(form, "NOT_FOUND");
    trpcAssert(form.status === Status.ACCEPTED, "UNAUTHORIZED");

    await ctx.prisma?.formSubmission.update({
      where: {
        formStructureId_submitterId: {
          formStructureId: formName,
          submitterId: ctx.session.user.id,
        },
      },
      data: { status: Status.RSVP },
    });

    await ctx.logsnag.track({
      channel: "rsvps",
      event: "RSVP Submitted",
      user_id: `${ctx.session.user.name} - ${ctx.session.user.email}`,
      description: `${ctx.session.user.name} has submitted their RSVP.`,
      icon: "🎉",
    });
  }),
  getApplicationShallow: protectedProcedure
    .input(
      z.object({
        submitterId: z.string().nullable(),
      })
    )
    .query(async ({ ctx, input }): Promise<FormSubmission | null> => {
      if (!input.submitterId) {
        return null;
      }

      const formName = await Config.getDeltaHacksApplicationFormName(
        ctx.prisma
      );
      if (!formName) {
        return null;
      }

      const application = await ctx.prisma.formSubmission.findFirst({
        where: {
          formStructureId: formName,
          submitterId: input.submitterId,
        },
      });
      return application;
    }),
  submit: protectedProcedure
    .input(applicationSchema)
    .mutation(async ({ ctx, input }) => {
      const deltaHacksApplicationFormName =
        await Config.getDeltaHacksApplicationFormName(ctx.prisma);

      trpcAssert(
        deltaHacksApplicationFormName,
        "NOT_FOUND",
        "No form for the User to submit to"
      );

      const formSubmission = await ctx.prisma.formSubmission.create({
        data: {
          formStructureId: deltaHacksApplicationFormName,
          submitterId: ctx.session.user.id,
          status: Status.IN_REVIEW,
        },
      });

      // IMPORTANT
      // this is all temporary code that will be replaced in the future
      // Assumptions are made about the Category table and Question table.
      // Do not mimmick what you see here
      let gradDate = null;
      if (input.studyExpectedGraduation) {
        const possible = new Date(input.studyExpectedGraduation);
        if (!Number.isNaN(possible.getTime())) {
          gradDate = possible;
        }
      }

      const getQuestionId = async (position: number) => {
        const question = await prisma?.formItem.findUnique({
          where: {
            formPosition_formStructureId: {
              formPosition: position,
              formStructureId: deltaHacksApplicationFormName,
            },
          },
          select: {
            id: true,
          },
        });
        trpcAssert(question, "NOT_FOUND");
        return question.id;
      };

      const answers: AnswerForRouter[] = [
        {
          statement: input.firstName,
          addressedQuestionId: await getQuestionId(1),
        },
        {
          statement: input.lastName,
          addressedQuestionId: await getQuestionId(2),
        },
        {
          statement: input.birthday.toISOString().substring(0, 10),
          addressedQuestionId: await getQuestionId(3),
        },
        {
          statement: input.linkToResume,
          addressedQuestionId: await getQuestionId(4),
        },
        {
          statement: input.macEv.toString(),
          addressedQuestionId: await getQuestionId(5),
        },
        {
          statement: input.studyEnrolledPostSecondary.toString(),
          addressedQuestionId: await getQuestionId(7),
        },
        {
          statement: input.studyLocation ?? null,
          addressedQuestionId: await getQuestionId(8),
        },
        {
          statement: input.studyDegree ?? null,
          addressedQuestionId: await getQuestionId(9),
        },
        {
          statement: input.studyMajor ?? null,
          addressedQuestionId: await getQuestionId(10),
        },
        {
          statement: input.studyYearOfStudy ?? null,
          addressedQuestionId: await getQuestionId(11),
        },
        {
          statement: gradDate?.toISOString().substring(0, 10) ?? null,
          addressedQuestionId: await getQuestionId(12),
        },
        {
          statement: input.previousHackathonsCount.toString(),
          addressedQuestionId: await getQuestionId(13),
        },
        {
          statement: input.longAnswerChange,
          addressedQuestionId: await getQuestionId(15),
        },
        {
          statement: input.longAnswerExperience,
          addressedQuestionId: await getQuestionId(16),
        },
        {
          statement: input.longAnswerTech,
          addressedQuestionId: await getQuestionId(17),
        },
        {
          statement: input.longAnswerMagic,
          addressedQuestionId: await getQuestionId(18),
        },
        {
          statement: input.socialText ?? null,
          addressedQuestionId: await getQuestionId(20),
        },
        {
          statement: input.interests?.toString() ?? null,
          addressedQuestionId: await getQuestionId(21),
        },
        {
          statement: input.tshirtSize,
          addressedQuestionId: await getQuestionId(22),
        },
        {
          statement: input.hackerKind,
          addressedQuestionId: await getQuestionId(23),
        },
        {
          statement: JSON.stringify(input.workshopChoices),
          addressedQuestionId: await getQuestionId(24),
        },
        {
          statement: JSON.stringify(input.discoverdFrom.toString()),
          addressedQuestionId: await getQuestionId(25),
        },
        {
          statement: input.gender,
          addressedQuestionId: await getQuestionId(26),
        },
        {
          statement: input.race,
          addressedQuestionId: await getQuestionId(27),
        },
        {
          statement: input.alreadyHaveTeam.toString(),
          addressedQuestionId: await getQuestionId(28),
        },
        {
          statement: input.considerCoffee.toString(),
          addressedQuestionId: await getQuestionId(29),
        },
        {
          statement: input.emergencyContactName,
          addressedQuestionId: await getQuestionId(31),
        },
        {
          statement: input.emergencyContactRelation,
          addressedQuestionId: await getQuestionId(32),
        },
        {
          statement: input.emergencyContactPhone,
          addressedQuestionId: await getQuestionId(33),
        },
        {
          statement: input.agreeToMLHCodeOfConduct.toString(),
          addressedQuestionId: await getQuestionId(35),
        },
        {
          statement: input.agreeToMLHPrivacyPolicy.toString(),
          addressedQuestionId: await getQuestionId(36),
        },
        {
          statement: input.agreeToMLHCommunications.toString(),
          addressedQuestionId: await getQuestionId(37),
        },
      ];

      console.log("formsubmission: ", formSubmission.id);
      await ctx.prisma.answer.createMany({
        data: answers.map((answerPartial) => ({
          ...answerPartial,
          formSubmissionId: formSubmission.id,
        })),
      });

      await ctx.logsnag.track({
        channel: "applications",
        event: "Application Submitted",
        user_id: `${ctx.session.user.name} - ${ctx.session.user.email}`,
        description: "A user has submitted an application.",
        icon: "📝",
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
  getUser: protectedProcedure.query(async ({ ctx }) => {
    // find their typeform response id
    const user = await ctx.prisma.user.findFirst({
      where: { id: ctx.session.user.id },
    });

    if (
      user?.typeform_response_id === null ||
      user?.typeform_response_id === undefined
    ) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const url = `https://api.typeform.com/forms/MVo09hRB/responses?included_response_ids=${user.typeform_response_id}`;
    const res = await fetch(url, options);
    const data: TypeFormResponse = await res.json();

    const converted: TypeFormSubmissionTruncated[] = data.items.map((item) => {
      const responsePreprocessing = new Map<string, TypeFormResponseField>();
      for (const answer of item.answers) {
        responsePreprocessing.set(answer.field.id, answer);
      }

      return {
        response_id: item.response_id,
        firstName: responsePreprocessing.get("nfGel41KT3dP")?.text ?? "N/A",
        lastName: responsePreprocessing.get("mwP5oTr2JHgD")?.text ?? "N/A",
        birthday: new Date(
          responsePreprocessing.get("m7lNzS2BDhp1")?.date ?? "1000-01-01"
        ),
      };
    });
    // Convert from TypeFormResponse to TypeFormSubmission
    return {
      typeform: converted[0],
      mealData: { lastMeal: user.lastMealTaken, mealsTaken: user.mealsTaken },
    };
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
  getPrevAutofill: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        dh10application: true,
      },
    });

    return user?.dh10application ?? {};
  }),
  deleteApplication: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: { id: input.userId },
      });
      trpcAssert(user, "NOT_FOUND");

      const deltaHacksApplicationFormName =
        await Config.getDeltaHacksApplicationFormName(ctx.prisma);

      if (!deltaHacksApplicationFormName) {
        console.log("No application found to delete.");
        return;
      }

      try {
        await ctx.prisma.formSubmission.delete({
          where: {
            formStructureId_submitterId: {
              formStructureId: deltaHacksApplicationFormName,
              submitterId: ctx.session.user.id,
            },
          },
        });
        // create logsnag log
        await ctx.logsnag.track({
          channel: "applications",
          event: "Application Deleted",
          user_id: `${user.name} - ${user.email}`,
          description: "A user has deleted their application.",
          icon: "🗑️",
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete the application.",
        });
      }
    }),
});
