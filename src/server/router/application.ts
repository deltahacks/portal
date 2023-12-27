import { Prisma, Status, Role } from "@prisma/client";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { env } from "../../env/server.mjs";
import { protectedProcedure, router } from "./trpc";
import applicationSchema from "../../schemas/application";

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
      let statusCount = (
        await ctx.prisma.user.groupBy({
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
        include: { dh10application: true },
      });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (
        user.dH10ApplicationId === null ||
        user.dH10ApplicationId === undefined
      ) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return user.status;
    }),
  qr: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findFirst({
      where: { id: ctx.session.user.id },
    });
    const qr = user?.qrcode;

    return qr;
  }),
  rsvp: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.prisma?.user.findFirst({
      where: { id: ctx.session.user.id },
    });

    if (user?.status != Status.ACCEPTED) {
      throw new Error("Unauthorized call");
    }

    await ctx.prisma?.user.update({
      where: { id: ctx.session.user.id },
      data: { status: Status.RSVP },
    });
    await ctx.logsnag.track({
      channel: "rsvps",
      event: "RSVP Submitted",
      user_id: `${user.name} - ${user.email}`,
      description: `${user.name} has submitted their RSVP.`,
      icon: "🎉",
    });
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
    // get the current user's typeform response id
    const user = await ctx.prisma.user.findFirst({
      where: { id: ctx.session.user.id },
    });

    if (
      user?.typeform_response_id === null ||
      user?.typeform_response_id === undefined
    ) {
      return {};
    }

    const url = `https://api.typeform.com/forms/MVo09hRB/responses?included_response_ids=${user.typeform_response_id}`;
    const res = await fetch(url, options);
    const data: TypeFormResponse = await res.json();

    const converted = data.items.map((item) => {
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
        currentLevel: responsePreprocessing.get("3SPBWlps2PBj")?.text ?? "N/A",
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
        howDidYouHear: responsePreprocessing.get("OoutsXd4RFcR")?.text ?? "N/A",
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
      };
    })[0];

    if (converted === undefined) {
      return {};
    }

    const pt = applicationSchema.partial();

    type AutofillType = z.infer<typeof pt>;

    const autofill: AutofillType = {};

    if (converted.firstName !== "N/A") {
      autofill["firstName"] = converted.firstName;
    }
    if (converted.lastName !== "N/A") {
      autofill["lastName"] = converted.lastName;
    }
    if (converted.birthday !== undefined) {
      autofill["birthday"] = converted.birthday.toISOString().slice(0, 10);
    }

    if (converted.major !== "N/A") {
      autofill["studyMajor"] = converted.major;
    }
    if (converted.school !== "N/A") {
      autofill["studyLocation"] = converted.school;
    }
    if (converted.willBeEnrolled !== false) {
      autofill["studyEnrolledPostSecondary"] = converted.willBeEnrolled;
    }
    if (converted.graduationYear !== undefined) {
      autofill["studyExpectedGraduation"] = converted.graduationYear
        .toISOString()
        .slice(0, 10);
    }
    if (converted.degree !== "N/A") {
      autofill["studyDegree"] = converted.degree;
    }

    if (converted.hackathonCount !== "N/A") {
      autofill["previousHackathonsCount"] = parseInt(converted.hackathonCount);
    }
    // emergencyContact

    if (converted.emergencyContactInfo.firstName !== "N/A") {
      autofill["emergencyContactName"] =
        converted.emergencyContactInfo.firstName;
    }

    if (converted.emergencyContactInfo.lastName !== "N/A") {
      autofill["emergencyContactName"] =
        autofill["emergencyContactName"] +
        " " +
        converted.emergencyContactInfo.lastName;
    }

    if (converted.emergencyContactInfo.phoneNumber !== "N/A") {
      autofill["emergencyContactPhone"] =
        converted.emergencyContactInfo.phoneNumber;
    }

    if (converted.socialLinks !== "N/A") {
      autofill["socialText"] = converted.socialLinks;
    }

    if (converted.tshirtSize !== "N/A") {
      if (z.enum(["XS", "S", "M", "L", "XL"]).parse(converted.tshirtSize)) {
        autofill["tshirtSize"] = converted.tshirtSize as
          | "XS"
          | "S"
          | "M"
          | "L"
          | "XL";
      }
    }
    // console.log(autofill)

    return autofill;
  }),
  submitDh10: protectedProcedure
    .input(applicationSchema)
    .mutation(async ({ ctx, input }) => {
      // make sure there is no existing application

      try {
        let gradDate = null;
        if (input.studyExpectedGraduation) {
          const possible = new Date(input.studyExpectedGraduation);
          if (!isNaN(possible.getTime())) {
            gradDate = possible;
          }
        }

        await ctx.prisma.dH10Application.create({
          data: {
            ...input,
            birthday: new Date(input.birthday),
            studyExpectedGraduation: gradDate,
            User: { connect: { id: ctx.session.user.id } },
          },
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
    }),

  deleteApplication: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.prisma.user.findFirst({
      where: { id: ctx.session.user.id },
    });
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
    if (
      user.dH10ApplicationId === null ||
      user.dH10ApplicationId === undefined
    ) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
    try {
      await ctx.prisma.dH10Application.delete({
        where: { id: user.dH10ApplicationId },
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
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete the application.",
      });
    }
  }),
});
