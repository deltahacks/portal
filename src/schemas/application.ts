import z from "zod";
import isMobilePhone from "validator/lib/isMobilePhone";

const dh10schema = z.object({
  firstName: z.string().min(1).max(255),
  lastName: z.string().min(1).max(255),
  birthday: z.coerce.date().refine(
    (date) => {
      // make sure over 15
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
      return age >= 13;
    },
    {
      message: "You must be at least 13 years old",
    },
  ),
  macEv: z.boolean(),
  linkToResume: z.nullable(z.string()),
  studyEnrolledPostSecondary: z.boolean(),
  studyLocation: z.string().min(1).max(255).nullish(),
  studyDegree: z.string().min(1).max(255).nullish(),
  studyMajor: z.string().min(1).max(255).nullish(),
  studyYearOfStudy: z.string().nullish(),
  studyExpectedGraduation: z.coerce.date().nullish(),
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
    .refine((value) => value.trim().split(/\s/).length <= 150, {
      message: "Must be less than 150 words",
    }),
  socialText: z
    .string()
    .transform((string) => (!!string ? string : null))
    .nullish(),
  interests: z
    .string()
    .refine((value) => value.split(/\s/g).length <= 150, {
      message: "Must be less than 150 words",
    })
    .transform((string) => (!!string ? string : null))
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
  emergencyContactPhone: z
    .string()
    .refine(isMobilePhone, "Invalid phone number"),
  emergencyContactRelation: z.string().min(1),
  agreeToMLHCodeOfConduct: z.boolean().refine((value) => value === true, {
    message: "You must agree to the MLH Code of Conduct",
  }),
  agreeToMLHPrivacyPolicy: z.boolean().refine((value) => value === true, {
    message: "You must agree to the MLH Privacy Policy",
  }),
  agreeToMLHCommunications: z.boolean(),
});

const Status = z.enum(["IN_REVIEW", "ACCEPTED", "REJECTED", "WAITLISTED"]);
const YesNoUnsure = z.enum(["YES", "NO", "UNSURE"]);

const dh11schema = z.object({
  firstName: z.string().min(1, "First name is required").max(255),
  lastName: z.string().min(1, "Last name is required").max(255),
  birthday: z.coerce.date().refine(
    (date) => {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
      return age >= 13;
    },
    {
      message: "You must be at least 13 years old",
    },
  ),
  phone: z.string().refine(isMobilePhone, "Invalid phone number").nullish(),
  country: z.string().nullish(),
  studyEnrolledPostSecondary: z.boolean(),
  studyLocation: z.string().min(1).max(255).nullish(),
  studyDegree: z.string().min(1).max(255).nullish(),
  studyMajor: z.string().min(1).max(255).nullish(),
  studyYearOfStudy: z.string().nullish(),
  studyExpectedGraduation: z.coerce.date().nullish(),
  previousHackathonsCount: z.coerce.number().int().min(0),
  longAnswerIncident: z
    .string()
    .min(1, "An answer is required for this question")
    .refine((value) => value.split(/\s/g).length <= 150, {
      message: "Must be less than 150 words",
    }),
  longAnswerGoals: z
    .string()
    .min(1, "An answer is required for this question")
    .refine((value) => value.split(/\s/g).length <= 150, {
      message: "Must be less than 150 words",
    }),
  longAnswerFood: z
    .string()
    .min(1, "An answer is required for this question")
    .refine((value) => value.split(/\s/g).length <= 150, {
      message: "Must be less than 150 words",
    }),
  longAnswerTravel: z
    .string()
    .min(1, "An answer is required for this question")
    .refine((value) => value.split(/\s/g).length <= 150, {
      message: "Must be less than 150 words",
    }),
  longAnswerSocratica: z
    .string()
    .min(1, "An answer is required for this question")
    .refine((value) => value.split(/\s/g).length <= 150, {
      message: "Must be less than 150 words",
    }),
  socialText: z.array(z.string()),
  interests: z
    .string()
    .refine((value) => value.split(/\s/g).length <= 150, {
      message: "Must be less than 150 words",
    })
    .transform((string) => (!!string ? string : null))
    .nullish(),
  linkToResume: z.string().nullish(),
  tshirtSize: z.enum(["XS", "S", "M", "L", "XL"]),
  hackerKind: z.array(z.string()).min(1, "At least one selection is required"),
  alreadyHaveTeam: z.boolean(),
  workshopChoices: z.array(z.string()),
  discoverdFrom: z
    .array(z.string())
    .min(1, "At least one selection is required"),
  considerCoffee: z.boolean(),
  dietaryRestrictions: z.string().nullish(),
  underrepresented: YesNoUnsure,
  gender: z.string(),
  race: z.string(),
  orientation: z.string(),
  emergencyContactName: z.string().min(1, "This field is required"),
  emergencyContactPhone: z
    .string()
    .refine(isMobilePhone, "Invalid phone number"),
  emergencyContactRelation: z.string().min(1, "This field is required"),
  agreeToMLHCodeOfConduct: z.boolean().refine((value) => value === true, {
    message: "You must agree to the MLH Code of Conduct",
  }),
  agreeToMLHPrivacyPolicy: z.boolean().refine((value) => value === true, {
    message: "You must agree to the MLH Privacy Policy",
  }),
  agreeToMLHCommunications: z.boolean(),
});

export default dh11schema;
