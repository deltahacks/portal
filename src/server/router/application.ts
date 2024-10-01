import { Prisma, Status, Role, FormSubmission } from "@prisma/client";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { env } from "../../env/server.mjs";
import { protectedProcedure, router } from "./trpc";
import applicationSchema from "../../schemas/application";
import { DirectPrismaQuerier } from "../db/directQueries";
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

      const directQuerier = new DirectPrismaQuerier(ctx.prisma);
      const hackathonYear = await directQuerier.getHackathonYear();

      const statusCount = (
        await ctx.prisma.formSubmission.groupBy({
          by: ["status"],
          where: {
            formYear: hackathonYear,
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
    const querier = new DirectPrismaQuerier(ctx.prisma);
    const hackathonYear = await querier.getHackathonYear();
    const form = await ctx.prisma?.formSubmission.findFirst({
      where: { submitterId: ctx.session.user.id, formYear: hackathonYear },
    });

    trpcAssert(form?.status !== Status.ACCEPTED, "UNAUTHORIZED");

    await ctx.prisma?.formSubmission.update({
      where: {
        formYear_submitterId: {
          formYear: hackathonYear,
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

      const directQuerier = new DirectPrismaQuerier(ctx.prisma);
      const application = await directQuerier.getUserApplication(
        ctx.session.user.id
      );
      return application;
    }),
  submit: protectedProcedure
    .input(applicationSchema)
    .mutation(async ({ ctx, input }) => {
      const directQuerier = new DirectPrismaQuerier(ctx.prisma);
      const hackathonYear = await directQuerier.getHackathonYear();

      const formSubmission = {
        formYear: hackathonYear,
        submitterId: ctx.session.user.id,
        status: Status.IN_REVIEW,
      };
      await ctx.prisma.formSubmission.upsert({
        where: {
          formYear_submitterId: {
            formYear: formSubmission.formYear,
            submitterId: formSubmission.submitterId,
          },
        },
        update: formSubmission,
        create: formSubmission,
      });

      let gradDate = null;
      if (input.studyExpectedGraduation) {
        const possible = new Date(input.studyExpectedGraduation);
        if (!isNaN(possible.getTime())) {
          gradDate = possible;
        }
      }

      const answers: AnswerForRouter[] = [
        { statement: input.firstName, addressedQuestionId: "first_name" },
        { statement: input.lastName, addressedQuestionId: "last_name" },
        {
          statement: input.birthday.toISOString().substring(0, 10),
          addressedQuestionId: "birthday",
        },
        { statement: input.linkToResume, addressedQuestionId: "resume" },
        {
          statement: input.macEv.toString(),
          addressedQuestionId: "mac_experience_ventures",
        },
        {
          statement: input.studyEnrolledPostSecondary.toString(),
          addressedQuestionId: "study_enrolled_post_secondary",
        },
        {
          statement: input.studyLocation ?? null,
          addressedQuestionId: "study_location",
        },
        {
          statement: input.studyDegree ?? null,
          addressedQuestionId: "study_degree",
        },
        {
          statement: input.studyMajor ?? null,
          addressedQuestionId: "study_major",
        },
        {
          statement: input.studyYearOfStudy ?? null,
          addressedQuestionId: "study_year",
        },
        {
          statement: gradDate?.toISOString().substring(0, 10) ?? null,
          addressedQuestionId: "study_expected_grad",
        },
        {
          statement: input.previousHackathonsCount.toString(),
          addressedQuestionId: "prev_hackathons_count",
        },
        {
          statement: input.longAnswerChange,
          addressedQuestionId: "long_answer_1",
        },
        {
          statement: input.longAnswerExperience,
          addressedQuestionId: "long_answer_2",
        },
        {
          statement: input.longAnswerTech,
          addressedQuestionId: "long_answer_3",
        },
        {
          statement: input.longAnswerMagic,
          addressedQuestionId: "long_answer_4",
        },
        {
          statement: input.socialText ?? null,
          addressedQuestionId: "social_links",
        },
        {
          statement: input.interests?.toString() ?? null,
          addressedQuestionId: "interests",
        },
        { statement: input.tshirtSize, addressedQuestionId: "tshirt_size" },
        { statement: input.hackerKind, addressedQuestionId: "hacker_skill" },
        {
          statement: JSON.stringify(input.workshopChoices),
          addressedQuestionId: "interested_workshops",
        },
        {
          statement: JSON.stringify(input.discoverdFrom.toString()),
          addressedQuestionId: "how_discovered",
        },
        { statement: input.gender, addressedQuestionId: "gender" },
        { statement: input.race, addressedQuestionId: "race" },
        {
          statement: input.alreadyHaveTeam.toString(),
          addressedQuestionId: "already_have_team",
        },
        {
          statement: input.considerCoffee.toString(),
          addressedQuestionId: "consider_coffee",
        },
        {
          statement: input.emergencyContactName,
          addressedQuestionId: "emergency_contact_name",
        },
        {
          statement: input.emergencyContactRelation,
          addressedQuestionId: "emergency_contact_relation",
        },
        {
          statement: input.emergencyContactPhone,
          addressedQuestionId: "emergency_contact_phone",
        },
        {
          statement: input.agreeToMLHCodeOfConduct.toString(),
          addressedQuestionId: "agree_to_mlh_code_of_conduct",
        },
        {
          statement: input.agreeToMLHPrivacyPolicy.toString(),
          addressedQuestionId: "agree_to_mlh_privacy_policy",
        },
        {
          statement: input.agreeToMLHCommunications.toString(),
          addressedQuestionId: "agree_to_mlh_communications",
        },
      ];

      await Promise.all(
        answers.map(async (answerPartial) => {
          const answer = {
            ...answerPartial,
            submitterId: ctx.session.user.id,
            formYear: hackathonYear,
          };
          await ctx.prisma.answer.upsert({
            where: {
              addressedQuestionId_submitterId_formYear: {
                addressedQuestionId: answer.addressedQuestionId,
                submitterId: answer.submitterId,
                formYear: answer.formYear,
              },
            },
            update: answer,
            create: answer,
          });
        })
      );

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
});
