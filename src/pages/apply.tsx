import type { GetServerSidePropsContext, NextPage } from "next";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { prisma } from "../server/db/client";
import { trpc } from "../utils/trpc";
import { useRouter } from "next/router";
import { useForm, SubmitHandler } from "react-hook-form";
import FormTextInput from "../components/FormTextInput";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Head from "next/head";
import Link from "next/link";
import { Drawer } from "../components/NavBar";

// export type Inputs = {
//   name: string;
// };

const schema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  birthday: z.date(),
  studyEnrolledPostSecondary: z.boolean(),
  studyLocation: z.string(),
  studyDegree: z.string(),
  studyMajor: z.string(),
  studyYearOfStudy: z.number().int(),
  studyExpectedGraduation: z.date(),
  previousHackathonsCount: z.number().int(),
  longAnswerChange: z.string(),
  longAnswerExperience: z.string(),
  longAnswerTech: z.string(),
  longAnswerMeaning: z.string(),
  longAnswerFuture: z.string(),
  longAnswerMagic: z.string(),
  socialText: z.string().nullish(),
  interests: z.string().nullish(),
  tshirtSize: z.enum(["XS", "S", "M", "L", "XL"]),
  hackerKind: z.string(),
  alreadyHaveTeam: z.boolean(),
  workshopChoices: z.string().array(),
  considerCoffee: z.boolean(),
  discoverdFrom: z.string(),
  gender: z.string(),
  race: z.string(),
  emergencyContactName: z.string(),
  emergencyContactPhone: z.string(),
  emergencyContactRelation: z.string(),
  agreeToMLHCodeOfConduct: z.boolean(),
  agreeToMLHPrivacyPolicy: z.boolean(),
  agreeToMLHCommunications: z.boolean(),
});

export type InputsType = z.infer<typeof schema>;

const Apply: NextPage = () => {
  const router = useRouter();
  const submitResponseId = trpc.application.submit.useMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InputsType>({
    resolver: zodResolver(schema),
  });
  const onSubmit: SubmitHandler<InputsType> = (data) => {
    console.log(data);
    // schema.parse(data);
  };

  return (
    <>
      <Head>
        <title>Welcome - DeltaHacks X</title>
      </Head>
      <Drawer>
        <div className="mx-auto w-1/2 max-w-4xl">
          <h1 className="py-8 text-4xl font-bold">Apply to DeltaHacks X</h1>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto flex  flex-col"
          >
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="firstNameInput">First Name</label>
              <input
                className="input rounded-sm border border-primary p-2"
                type="text"
                id="firstNameInput"
                {...register("firstName", { required: true })}
              />
              {errors.firstName && <span>This field is required</span>}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="lastNameInput">Last Name</label>
              <input
                className="input rounded-sm border border-primary p-2"
                type="text"
                id="lastNameInput"
                {...register("lastName", { required: true })}
              />
              {errors.lastName && <span>This field is required</span>}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="birthdayInput">Birthday</label>
              <input
                className="input rounded-sm border border-primary p-2"
                type="date"
                id="birthdayInput"
                {...register("birthday", { required: true })}
              />
              {errors.birthday && <span>This field is required</span>}
            </div>
            <div className="justify-left flex flex-col gap-2 pb-4">
              <label htmlFor="studyEnrolledPostSecondaryInput">
                Enrolled in Post Secondary Education?
              </label>
              <input
                className="checkbox rounded-sm border border-primary p-2"
                type="checkbox"
                id="studyEnrolledPostSecondaryInput"
                {...register("studyEnrolledPostSecondary")}
              />
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="studyLocationInput">Study Location</label>
              <input
                className="input rounded-sm border border-primary p-2"
                type="text"
                id="studyLocationInput"
                {...register("studyLocation", { required: true })}
              />
              {errors.studyLocation && <span>This field is required</span>}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="studyDegreeInput">Study Degree</label>
              <input
                className="input rounded-sm border border-primary p-2"
                type="text"
                id="studyDegreeInput"
                {...register("studyDegree", { required: true })}
              />
              {errors.studyDegree && <span>This field is required</span>}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="studyMajorInput">Study Major</label>
              <input
                className="input rounded-sm border border-primary p-2"
                type="text"
                id="studyMajorInput"
                {...register("studyMajor", { required: true })}
              />
              {errors.studyMajor && <span>This field is required</span>}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="studyYearOfStudyInput">Year of Study</label>
              <input
                className="input rounded-sm border border-primary p-2"
                type="number"
                id="studyYearOfStudyInput"
                {...register("studyYearOfStudy", { required: true })}
              />
              {errors.studyYearOfStudy && <span>This field is required</span>}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="studyExpectedGraduationInput">
                Expected Graduation
              </label>
              <input
                className="input rounded-sm border border-primary p-2"
                type="date"
                id="studyExpectedGraduationInput"
                {...register("studyExpectedGraduation", { required: true })}
              />
              {errors.studyExpectedGraduation && (
                <span>This field is required</span>
              )}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="previousHackathonsCountInput">
                Previous Hackathons Count
              </label>
              <input
                className="input rounded-sm border border-primary p-2"
                type="number"
                id="previousHackathonsCountInput"
                {...register("previousHackathonsCount", { required: true })}
              />
              {errors.previousHackathonsCount && (
                <span>This field is required</span>
              )}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="longAnswerChangeInput">Long Answer: Change</label>
              <textarea
                id="longAnswerChangeInput"
                {...register("longAnswerChange", { required: true })}
              />
              {errors.longAnswerChange && <span>This field is required</span>}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="longAnswerExperienceInput">
                Long Answer: Experience
              </label>
              <textarea
                id="longAnswerExperienceInput"
                {...register("longAnswerExperience", { required: true })}
              />
              {errors.longAnswerExperience && (
                <span>This field is required</span>
              )}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="longAnswerTechInput">Long Answer: Tech</label>
              <textarea
                id="longAnswerTechInput"
                {...register("longAnswerTech", { required: true })}
              />
              {errors.longAnswerTech && <span>This field is required</span>}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="longAnswerMeaningInput">
                Long Answer: Meaning
              </label>
              <textarea
                id="longAnswerMeaningInput"
                {...register("longAnswerMeaning", { required: true })}
              />
              {errors.longAnswerMeaning && <span>This field is required</span>}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="longAnswerFutureInput">Long Answer: Future</label>
              <textarea
                id="longAnswerFutureInput"
                {...register("longAnswerFuture", { required: true })}
              />
              {errors.longAnswerFuture && <span>This field is required</span>}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="longAnswerMagicInput">Long Answer: Magic</label>
              <textarea
                id="longAnswerMagicInput"
                {...register("longAnswerMagic", { required: true })}
              />
              {errors.longAnswerMagic && <span>This field is required</span>}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="socialTextInput">Social Text</label>
              <input
                className="input rounded-sm border border-primary p-2"
                type="text"
                id="socialTextInput"
                {...register("socialText")}
              />
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="interestsInput">Interests</label>
              <input
                className="input rounded-sm border border-primary p-2"
                type="text"
                id="interestsInput"
                {...register("interests")}
              />
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="tshirtSizeInput">T-shirt Size</label>
              <input
                className="input rounded-sm border border-primary p-2"
                type="text"
                id="tshirtSizeInput"
                {...register("tshirtSize", { required: true })}
              />
              {errors.tshirtSize && <span>This field is required</span>}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="hackerKindInput">Hacker Kind</label>
              <input
                className="input rounded-sm border border-primary p-2"
                type="text"
                id="hackerKindInput"
                {...register("hackerKind", { required: true })}
              />
              {errors.hackerKind && <span>This field is required</span>}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="alreadyHaveTeamInput">Already Have a Team?</label>
              <input
                className="input rounded-sm border border-primary p-2"
                type="checkbox"
                id="alreadyHaveTeamInput"
                {...register("alreadyHaveTeam")}
              />
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="workshopChoicesInput">Workshop Choices</label>
              <select
                id="workshopChoicesInput"
                {...register("workshopChoices", { required: true })}
                multiple
              >
                <option value="Workshop A">Workshop A</option>
                <option value="Workshop B">Workshop B</option>
                <option value="Workshop C">Workshop C</option>
              </select>
              {errors.workshopChoices && <span>This field is required</span>}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="considerCoffeeInput">Consider Coffee</label>
              <input
                className="input rounded-sm border border-primary p-2"
                type="checkbox"
                id="considerCoffeeInput"
                {...register("considerCoffee")}
              />
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="discoverdFromInput">Discovered From</label>
              <input
                className="input rounded-sm border border-primary p-2"
                type="text"
                id="discoverdFromInput"
                {...register("discoverdFrom", { required: true })}
              />
              {errors.discoverdFrom && <span>This field is required</span>}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="genderInput">Gender</label>
              <input
                className="input rounded-sm border border-primary p-2"
                type="text"
                id="genderInput"
                {...register("gender", { required: true })}
              />
              {errors.gender && <span>This field is required</span>}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="raceInput">Race</label>
              <input
                className="input rounded-sm border border-primary p-2"
                type="text"
                id="raceInput"
                {...register("race", { required: true })}
              />
              {errors.race && <span>This field is required</span>}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="emergencyContactNameInput">
                Emergency Contact Name
              </label>
              <input
                className="input rounded-sm border border-primary p-2"
                type="text"
                id="emergencyContactNameInput"
                {...register("emergencyContactName", { required: true })}
              />
              {errors.emergencyContactName && (
                <span>This field is required</span>
              )}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="emergencyContactPhoneInput">
                Emergency Contact Phone
              </label>
              <input
                className="input rounded-sm border border-primary p-2"
                type="text"
                id="emergencyContactPhoneInput"
                {...register("emergencyContactPhone", { required: true })}
              />
              {errors.emergencyContactPhone && (
                <span>This field is required</span>
              )}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="emergencyContactRelationInput">
                Emergency Contact Relation
              </label>
              <input
                className="input rounded-sm border border-primary p-2"
                type="text"
                id="emergencyContactRelationInput"
                {...register("emergencyContactRelation", { required: true })}
              />
              {errors.emergencyContactRelation && (
                <span>This field is required</span>
              )}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="agreeToMLHCodeOfConductInput">
                Agree to MLH Code of Conduct
              </label>
              <input
                className="input rounded-sm border border-primary p-2"
                type="checkbox"
                id="agreeToMLHCodeOfConductInput"
                {...register("agreeToMLHCodeOfConduct")}
              />
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="agreeToMLHPrivacyPolicyInput">
                Agree to MLH Privacy Policy
              </label>
              <input
                className="input rounded-sm border border-primary p-2"
                type="checkbox"
                id="agreeToMLHPrivacyPolicyInput"
                {...register("agreeToMLHPrivacyPolicy")}
              />
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="agreeToMLHCommunicationsInput">
                Agree to MLH Communications
              </label>
              <input
                className="input rounded-sm border border-primary p-2"
                type="checkbox"
                id="agreeToMLHCommunicationsInput"
                {...register("agreeToMLHCommunications")}
              />
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>
      </Drawer>
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);

  if (!session || !session.user) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  const userEntry = await prisma.user.findFirst({
    where: { id: session.user.id },
  });

  // If submitted then go dashboard
  if (
    userEntry &&
    (userEntry.typeform_response_id === null ||
      userEntry.typeform_response_id === undefined)
  ) {
    return { props: {} };
  }
  return { redirect: { destination: "/dashboard", permanent: false } };
};

export default Apply;
