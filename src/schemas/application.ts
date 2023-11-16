import z from "zod";

const schema = z.object({
  firstName: z.string().min(1).max(255),
  lastName: z.string().min(1).max(255),
  birthday: z.string().refine(
    (value) => {
      // parse date
      const date = new Date(value);
      // make sure over 15
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
      return age >= 15;
    },
    {
      message: "You must be at least 15 years old",
    }
  ),
  linkToResume: z.nullable(z.string()),
  studyEnrolledPostSecondary: z.boolean(),
  studyLocation: z.string().min(1).max(255).nullish(),
  studyDegree: z.string().min(1).max(255).nullish(),
  studyMajor: z.string().min(1).max(255).nullish(),
  studyYearOfStudy: z.string().nullish(),
  studyExpectedGraduation: z.string().nullish(),
  previousHackathonsCount: z.coerce.number().int().min(0),
  longAnswerChange: z
    .string()
    .min(1, "An answer is required for this question")
    .refine((value) => value.split(/\s/g).length <= 150, {
      message: "Must be less than 150 words",
    }),
  longAnswerExperience: z
    .string()
    .min(1, "An answer is required for this question")
    .refine((value) => value.split(/\s/g).length <= 150, {
      message: "Must be less than 150 words",
    }),
  longAnswerTech: z
    .string()
    .min(1, "An answer is required for this question")
    .refine((value) => value.split(/\s/g).length <= 150, {
      message: "Must be less than 150 words",
    }),

  longAnswerMagic: z
    .string()
    .min(1, "An answer is required for this question")
    .refine((value) => value.trim().split(/\s+/).length <= 150, {
      message: "Must be less than 150 words",
    }),
  socialText: z
    .string()
    .transform((string) => string ?? null)
    .nullish(),
  interests: z
    .string()
    .refine((value) => value.split(/\s/g).length <= 150, {
      message: "Must be less than 150 words",
    })
    .transform((string) => string ?? null)
    .nullish(),
  tshirtSize: z.enum(["XS", "S", "M", "L", "XL"]),
  hackerKind: z.enum([
    "Front-end",
    "Back-end",
    "Design",
    "iOS Development",
    "Android Development",
    "Hardware",
    "Machine Learning",
    "Graphics Programming",
    "Data Analysis",
    "Game Development",
    "Writer",
    "Product Manager",
    "Other",
  ]),
  alreadyHaveTeam: z.boolean(),
  workshopChoices: z
    .enum([
      "React/Vue.js",
      "Blockchain",
      "Machine Learning",
      "Android Development",
      "iOS Development",
      "Web Development",
      "Intro to AR/VR",
      "Game Development",
      "Interview Prep",
      "Intro to UI/UX Design",
      "Hardware Hacking",
      "Computer Vision with OpenCV",
    ])
    .array(),
  considerCoffee: z.boolean(),
  discoverdFrom: z.string().min(1).max(255).array(),
  gender: z.enum([
    "Man",
    "Woman",
    "Non-binary",
    "Transgender",
    "Prefer not to say",
  ]),
  race: z.string().min(1).max(255),
  emergencyContactName: z.string().min(1),
  emergencyContactPhone: z.string().min(1),
  emergencyContactRelation: z.string().min(1),
  agreeToMLHCodeOfConduct: z.boolean().refine((value) => value === true, {
    message: "You must agree to the MLH Code of Conduct",
  }),
  agreeToMLHPrivacyPolicy: z.boolean().refine((value) => value === true, {
    message: "You must agree to the MLH Privacy Policy",
  }),
  agreeToMLHCommunications: z.boolean(),
});

export default schema;
