import { getEnvironmentData } from "worker_threads";
import { z } from "zod";
import { createProtectedRouter } from "./context";
import { env } from "../../env/server.mjs";

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

type TypeFormSubmission = z.infer<typeof TypeFormSubmission>;

const options = {
  method: "GET",
  headers: {
    Authorization: `Bearer ${env.TYPEFORM_API_KEY}`,
  },
};

export const reviewerRouter = createProtectedRouter().query("getApplications", {
  input: z.object({
    cursor: z.string().nullish(),
    limit: z.number().min(1).max(100).default(25),
  }),
  output: z.object({
    data: z.array(TypeFormSubmission),
    nextCursor: z.string().nullish(),
  }),
  async resolve({ ctx, input }) {
    console.log(input);

    const url = `https://api.typeform.com/forms/MVo09hRB/responses?completed=true${
      input ? (input.cursor ? `&before=${input.cursor}` : "") : ""
    }`;

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
        resume: responsePreprocessing.get("z8wTMK3lMO00")?.file_url,
        extra: responsePreprocessing.get("GUpky3mnQ3q5")?.text,
        tshirtSize: responsePreprocessing.get("Q9xv6pezGeSc").text!,
        hackerType: responsePreprocessing.get("k9BrMbznssVX").text!,
        hasTeam: responsePreprocessing.get("3h36sGge5G4X").boolean!,
        workShop: responsePreprocessing.get("Q3MisVaz3Ukw")?.text,
        gender: responsePreprocessing.get("b3sr6g16jGjj").text!,
        considerSponserChat: responsePreprocessing.get("LzF2H4Fjfwvq")?.boolean,
        howDidYouHear: responsePreprocessing.get("OoutsXd4RFcR").text!,
        background: responsePreprocessing.get("kGs2PWAnqBI3").text!,
        emergencyContactInfo: {
          firstName: responsePreprocessing.get("o5rMp5fj0BMa").text!,
          lastName: responsePreprocessing.get("irlsiZFKVJKD").text!,
          phoneNumber: responsePreprocessing.get("ceNTt9oUhO6Q").phone_number!,
          email: responsePreprocessing.get("onIT7bTImlRj")?.email,
        },
        mlhAgreement: responsePreprocessing.get("F3vbQhObxXFa").boolean!,
        mlhCoc: responsePreprocessing.get("f3ELfiV5gVSs").boolean!,
      };
    });

    const nextCursor = data.items[data.items.length - 1]?.token;

    return { data: converted, nextCursor: nextCursor };
  },
});
