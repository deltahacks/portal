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
            input ? input.cursor ? `&before=${input.cursor}` : "" : ""
        }`;

        const res = await fetch(url, options);

        const data: TypeFormResponse = await res.json();

        // Convert from TypeFormResponse to TypeFormSubmission

        const converted: TypeFormSubmission[] = data.items.map((item) => ({
            firstName: item.answers.find(
                (answer) => answer.field.id === "nfGel41KT3dP"
            )!.text!,
            lastName: item.answers.find(
                (answer) => answer.field.id === "mwP5oTr2JHgD"
            )!.text!,
            birthday: new Date(
                item.answers.find(
                    (answer) => answer.field.id === "m7lNzS2BDhp1"
                )!.date!
            ),
            major: item.answers.find(
                (answer) => answer.field.id === "PzclVTL14dsF"
            )!.text!,
            school: item.answers.find(
                (answer) => answer.field.id === "63Wa2JCZ1N3R"
            )!.text!,
            willBeEnrolled: item.answers.find(
                (answer) => answer.field.id === "rG4lrpFoXXpL"
            )!.boolean!,
            graduationYear: new Date(
                item.answers.find(
                    (answer) => answer.field.id === "Ez47B6N0QzKY"
                )!.date!
            ),
            degree: item.answers.find(
                (answer) => answer.field.id === "035Ul4T9mldq"
            )!.text!,
            currentLevel: item.answers.find(
                (answer) => answer.field.id === "3SPBWlps2PBj"
            )!.text!,
            hackathonCount: item.answers.find(
                (answer) => answer.field.id === "MyObNZSNMZOZ"
            )!.text!,
            longAnswer1: item.answers.find(
                (answer) => answer.field.id === "rCIqmnIUzvAV"
            )!.text!,
            longAnswer2: item.answers.find(
                (answer) => answer.field.id === "h084NVJ0kEsO"
            )!.text!,
            longAnswer3: item.answers.find(
                (answer) => answer.field.id === "wq7KawPVuW4I"
            )!.text!,
            socialLinks: item.answers.find(
                (answer) => answer.field.id === "CE5WnCcBNEtj"
            )?.text,
            resume: item.answers.find(
                (answer) => answer.field.id === "z8wTMK3lMO00"
            )?.file_url,
            extra: item.answers.find(
                (answer) => answer.field.id === "GUpky3mnQ3q5"
            )?.text,
            tshirtSize: item.answers.find(
                (answer) => answer.field.id === "Q9xv6pezGeSc"
            )!.text!,
            hackerType: item.answers.find(
                (answer) => answer.field.id === "k9BrMbznssVX"
            )!.text!,
            hasTeam: item.answers.find(
                (answer) => answer.field.id === "3h36sGge5G4X"
            )!.boolean!,
            workShop: item.answers.find(
                (answer) => answer.field.id === "Q3MisVaz3Ukw"
            )?.text,
            gender: item.answers.find(
                (answer) => answer.field.id === "b3sr6g16jGjj"
            )!.text!,
            considerSponserChat: item.answers.find(
                (answer) => answer.field.id === "LzF2H4Fjfwvq"
            )?.boolean,
            howDidYouHear: item.answers.find(
                (answer) => answer.field.id === "OoutsXd4RFcR"
            )!.text!,
            background: item.answers.find(
                (answer) => answer.field.id === "kGs2PWAnqBI3"
            )!.text!,
            emergencyContactInfo: {
                firstName: item.answers.find(
                    (answer) => answer.field.id === "o5rMp5fj0BMa"
                )!.text!,
                lastName: item.answers.find(
                    (answer) => answer.field.id === "irlsiZFKVJKD"
                )!.text!,
                phoneNumber: item.answers.find(
                    (answer) => answer.field.id === "ceNTt9oUhO6Q"
                )!.phone_number!,
                email: item.answers.find(
                    (answer) => answer.field.id === "onIT7bTImlRj"
                )?.email,
            },
            mlhAgreement: item.answers.find(
                (answer) => answer.field.id === "F3vbQhObxXFa"
            )!.boolean!,
            mlhCoc: item.answers.find(
                (answer) => answer.field.id === "f3ELfiV5gVSs"
            )!.boolean!,
        }));

        const nextCursor = data.items[data.items.length - 1]?.token;

        return { data: converted, nextCursor: nextCursor };
    },
});
