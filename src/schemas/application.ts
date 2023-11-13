import z from "zod";

const schema = z.object({
  firstName: z.string().min(1).max(255),
  lastName: z.string().min(1).max(255),
  birthday: z
    .date()
    .min(new Date(1900, 1, 1))
    .max(new Date(2009, 1, 12), "You must be at least 15 years old"),
  studyEnrolledPostSecondary: z.boolean(),
  studyLocation: z.string().min(1).max(255).nullable(),
  studyDegree: z.string().min(1).max(255).nullable(),
  studyMajor: z.string().min(1).max(255).nullable(),
  studyYearOfStudy: z.coerce.number().int().min(1).nullable(),
  studyExpectedGraduation: z.date().nullable(),
  previousHackathonsCount: z.coerce.number().int().min(0),
  longAnswerChange: z
    .string()
    .min(1)
    .refine((value) => value.split(" ").length <= 150, {
      message: "Must be less than 150 words",
    }),
  longAnswerExperience: z
    .string()
    .min(1)
    .refine((value) => value.split(" ").length <= 150, {
      message: "Must be less than 150 words",
    }),
  longAnswerTech: z
    .string()
    .min(1)
    .refine((value) => value.split(" ").length <= 150, {
      message: "Must be less than 150 words",
    }),

  longAnswerMagic: z
    .string()
    .min(1)
    .refine((value) => value.split(" ").length <= 150, {
      message: "Must be less than 150 words",
    }),
  socialText: z
    .string()
    .transform((string) => string ?? null)
    .nullable(),
  interests: z
    .string()
    .refine((value) => value.split(" ").length <= 100, {
      message: "Must be less than 150 words",
    })
    .transform((string) => string ?? null)
    .nullable(),
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
  workshopChoices: z.enum([
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
  ]),
  considerCoffee: z.boolean(),
  discoverdFrom: z.string().min(1).max(255),
  gender: z.enum(["Man","Woman","Non-binary","Transgender","Prefer not to say"]),
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
