import * as trpc from "@trpc/server";
import * as sgMail from "@sendgrid/mail";
import * as fs from "fs";
import { createProtectedRouter } from "./context";
import { Role } from "@prisma/client";
import { z } from "zod";
import type { TypeFormResponse, TypeFormResponseField } from "./reviewers";
import { TRPCError } from "@trpc/server";
import { env } from "../../env/server.mjs";

export const options = {
  method: "GET",
  headers: {
    Authorization: `Bearer ${env.TYPEFORM_API_KEY}`,
  },
};

const TypeFormSubmissionResume = z.object({
  response_id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  school: z.string(),
  degree: z.string(),
  currentLevel: z.string(),
  socialLinks: z.string().nullish(),
  resume: z.string().nullish(),
});

type TypeFormSubmissionResume = z.infer<typeof TypeFormSubmissionResume>;

export const sponsorRouter = createProtectedRouter()
  .query("getResume", {
    input: z.object({
      qrcode: z.number(),
      email: z.string(),
    }),
    async resolve({ ctx, input }) {
      if (
        !(
          ctx.session.user.role.includes(Role.ADMIN) ||
          ctx.session.user.role.includes(Role.SPONSER)
        )
      ) {
        throw new trpc.TRPCError({ code: "UNAUTHORIZED" });
      }
      const user = await ctx.prisma.user.findFirst({
        where: { qrcode: input.qrcode },
      });

      if (user === null || user === undefined) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const url = `https://api.typeform.com/forms/MVo09hRB/responses?included_response_ids=${user.typeform_response_id}`;
      const res = await fetch(url, options);
      const data: TypeFormResponse = await res.json();

      const converted: TypeFormSubmissionResume[] = data.items.map((item) => {
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
          resume:
            responsePreprocessing
              .get("z8wTMK3lMO00")
              ?.file_url?.replace(
                "https://api.typeform.com/forms",
                "/api/resumes"
              ) ?? "N/A",
        };
      });

      return converted[0];
    },
  })
  .mutation("sendResumeEmail", {
    input: z.object({
      qrcode: z.number(),
      email: z.string(),
    }),
    async resolve({ ctx, input }) {
      if (
        !(
          ctx.session.user.role.includes(Role.ADMIN) ||
          ctx.session.user.role.includes(Role.SPONSER)
        )
      ) {
        throw new trpc.TRPCError({ code: "UNAUTHORIZED" });
      }
      const user = await ctx.prisma.user.findFirst({
        where: { qrcode: input.qrcode },
      });

      if (user === null || user === undefined) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const url = `https://api.typeform.com/forms/MVo09hRB/responses?included_response_ids=${user.typeform_response_id}`;
      const res = await fetch(url, options);
      const data: TypeFormResponse = await res.json();

      const converted: TypeFormSubmissionResume[] = data.items.map((item) => {
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
          resume:
            responsePreprocessing
              .get("z8wTMK3lMO00")
              ?.file_url?.replace(
                "https://api.typeform.com/forms",
                "/api/resumes"
              ) ?? "N/A",
        };
      });

      sgMail.setApiKey(env.SENDGRID_API_KEY);

      const msg: sgMail.MailDataRequired = {
        to: input.email,
        from: "hello@deltahacks.com",
        subject: "Your DeltaHacks VI Scanned Resume",
        text: `Here is a resume you scanned at DeltaHacks IX:\n<b>Name:</b> ${
          converted[0]?.firstName
        } ${converted[0]?.lastName}\n
      <b>Resume Link:</b> ${
        "https://portal.deltahacks.com" + converted[0]?.resume
      }`,
        html: `<p>Here is a resume you scanned at DeltaHacks IX:</p>
      <p><b>Name:</b> ${converted[0]?.firstName} ${converted[0]?.lastName}</p>
      <p><b>Resume Link:</b> ${
        "https://portal.deltahacks.com" + converted[0]?.resume
      }</p>`,
      };

      sgMail
        .send(msg)
        .then(() => {
          console.log("Email sent");
        })
        .catch((error) => {
          console.error(error);
        });
    },
  });
