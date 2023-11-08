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
import { useEffect } from "react";

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
  studyYearOfStudy: z.coerce.number().int(),
  studyExpectedGraduation: z.date(),
  previousHackathonsCount: z.coerce.number().int(),
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
        <div className="mx-auto w-1/2 max-w-4xl text-white">
          <h1 className="py-8 text-4xl font-bold">Apply to DeltaHacks</h1>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto flex flex-col pb-8"
          >
            <span className="pb-2 border-b-2 mb-2 border-neutral-700 text-neutral-400">
              Subheading
            </span>
            <div className="flex gap-4 w-full">
              <div className="flex flex-col gap-2 pb-4 flex-1">
                <label htmlFor="firstNameInput">First Name</label>
                <input
                  className="input rounded-lg bg-neutral-800 p-3 placeholder:text-neutral-500 "
                  type="text"
                  id="firstNameInput"
                  placeholder="John"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <span className="text-error">This field is required</span>
                )}
              </div>
              <div className="flex flex-col gap-2 pb-4 flex-1">
                <label htmlFor="lastNameInput">Last Name</label>
                <input
                  className="input rounded-lg bg-neutral-800 p-3 placeholder:text-neutral-500 "
                  type="text"
                  id="lastNameInput"
                  placeholder="Doe"
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <span className="text-error">This field is required</span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="birthdayInput">Birthday</label>
              <input
                className="input rounded-lg bg-neutral-800 p-3 placeholder:text-neutral-500 "
                type="date"
                id="birthdayInput"
                {...register("birthday", { valueAsDate: true })}
              />
              {errors.birthday && (
                <span className="text-error">This field is required</span>
              )}
            </div>
            <span className="pb-2 border-b-2 mb-2 border-neutral-700 text-neutral-400">
              Education
            </span>
            <div className="justify-left flex gap-2 pb-4 pt-4 items-center">
              <input
                className="checkbox rounded-sm p-2 bg-neutral-800 checkbox-lg"
                type="checkbox"
                id="studyEnrolledPostSecondaryInput"
                {...register("studyEnrolledPostSecondary")}
              />
              <label htmlFor="studyEnrolledPostSecondaryInput">
                Are you currently enrolled in post-secondary education?
              </label>
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="studyLocationInput">Study Location</label>
              <input
                className="input rounded-lg bg-neutral-800 p-3 placeholder:text-neutral-500 "
                type="text"
                id="studyLocationInput"
                {...register("studyLocation")}
              />
              {errors.studyLocation && (
                <span className="text-error">This field is required</span>
              )}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="studyDegreeInput">Study Degree</label>
              <input
                className="input rounded-lg bg-neutral-800 p-3 placeholder:text-neutral-500 "
                type="text"
                id="studyDegreeInput"
                {...register("studyDegree")}
              />
              {errors.studyDegree && (
                <span className="text-error">This field is required</span>
              )}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="studyMajorInput">Study Major</label>
              <input
                className="input rounded-lg bg-neutral-800 p-3 placeholder:text-neutral-500 "
                type="text"
                id="studyMajorInput"
                {...register("studyMajor")}
              />
              {errors.studyMajor && (
                <span className="text-error">This field is required</span>
              )}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="studyYearOfStudyInput">Year of Study</label>
              <input
                className="input rounded-lg bg-neutral-800 p-3 placeholder:text-neutral-500 "
                type="number"
                id="studyYearOfStudyInput"
                {...register("studyYearOfStudy")}
              />
              {errors.studyYearOfStudy && (
                <span className="text-error">This field is required</span>
              )}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="studyExpectedGraduationInput">
                Expected Graduation
              </label>
              <input
                className="input rounded-lg bg-neutral-800 p-3 placeholder:text-neutral-500 "
                type="date"
                id="studyExpectedGraduationInput"
                {...(register("studyExpectedGraduation"),
                { valueAsDate: true })}
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
                className="input rounded-lg bg-neutral-800 p-3 placeholder:text-neutral-500 "
                type="number"
                id="previousHackathonsCountInput"
                {...register("previousHackathonsCount")}
              />
              {errors.previousHackathonsCount && (
                <span>This field is required</span>
              )}
            </div>
            <span className="pb-2 border-b-2 mb-2 border-neutral-700 text-neutral-400">
              Long Answer
            </span>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="longAnswerChangeInput">Long Answer: Change</label>
              <textarea
                className="textarea textarea-bordered bg-neutral-800 p-3 placeholder:text-neutral-500"
                id="longAnswerChangeInput"
                {...register("longAnswerChange")}
              />
              {errors.longAnswerChange && (
                <span className="text-error">This field is required</span>
              )}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="longAnswerExperienceInput">
                Long Answer: Experience
              </label>
              <textarea
                className="textarea textarea-bordered bg-neutral-800 p-3 placeholder:text-neutral-500"
                id="longAnswerExperienceInput"
                {...register("longAnswerExperience")}
              />
              {errors.longAnswerExperience && (
                <span>This field is required</span>
              )}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="longAnswerTechInput">Long Answer: Tech</label>
              <textarea
                className="textarea textarea-bordered bg-neutral-800 p-3 placeholder:text-neutral-500"
                id="longAnswerTechInput"
                {...register("longAnswerTech")}
              />
              {errors.longAnswerTech && (
                <span className="text-error">This field is required</span>
              )}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="longAnswerMeaningInput">
                Long Answer: Meaning
              </label>
              <textarea
                className="textarea textarea-bordered bg-neutral-800 p-3 placeholder:text-neutral-500"
                id="longAnswerMeaningInput"
                {...register("longAnswerMeaning")}
              />
              {errors.longAnswerMeaning && (
                <span className="text-error">This field is required</span>
              )}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="longAnswerFutureInput">Long Answer: Future</label>
              <textarea
                className="textarea textarea-bordered bg-neutral-800 p-3 placeholder:text-neutral-500"
                id="longAnswerFutureInput"
                {...register("longAnswerFuture")}
              />
              {errors.longAnswerFuture && (
                <span className="text-error">This field is required</span>
              )}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="longAnswerMagicInput">Long Answer: Magic</label>
              <textarea
                className="textarea textarea-bordered bg-neutral-800 p-3 placeholder:text-neutral-500"
                id="longAnswerMagicInput"
                {...register("longAnswerMagic")}
              />
              {errors.longAnswerMagic && (
                <span className="text-error">This field is required</span>
              )}
            </div>
            <span className="pb-2 border-b-2 mb-2 border-neutral-700 text-neutral-400">
              Survey
            </span>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="socialTextInput">Social Text</label>
              <input
                className="input rounded-lg bg-neutral-800 p-3 placeholder:text-neutral-500 "
                type="text"
                id="socialTextInput"
                {...register("socialText")}
              />
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="interestsInput">Interests</label>
              <input
                className="input rounded-lg bg-neutral-800 p-3 placeholder:text-neutral-500 "
                type="text"
                id="interestsInput"
                {...register("interests")}
              />
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="tshirtSizeInput">T-shirt Size</label>
              <input
                className="input rounded-lg bg-neutral-800 p-3 placeholder:text-neutral-500 "
                type="text"
                id="tshirtSizeInput"
                {...register("tshirtSize")}
              />
              {errors.tshirtSize && (
                <span className="text-error">This field is required</span>
              )}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="hackerKindInput">Hacker Kind</label>
              <input
                className="input rounded-lg bg-neutral-800 p-3 placeholder:text-neutral-500 "
                type="text"
                id="hackerKindInput"
                {...register("hackerKind")}
              />
              {errors.hackerKind && (
                <span className="text-error">This field is required</span>
              )}
            </div>
            <div className="justify-left flex gap-2 pb-4 pt-4 items-center">
              <input
                className="checkbox rounded-sm p-2"
                type="checkbox"
                id="alreadyHaveTeamInput"
                {...register("alreadyHaveTeam")}
              />
              <label htmlFor="alreadyHaveTeamInput">Already Have a Team?</label>
            </div>

            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="workshopChoicesInput">Workshop Choices</label>
              <select
                id="workshopChoicesInput"
                {...register("workshopChoices")}
                multiple
              >
                <option value="Workshop A">Workshop A</option>
                <option value="Workshop B">Workshop B</option>
                <option value="Workshop C">Workshop C</option>
              </select>
              {errors.workshopChoices && (
                <span className="text-error">This field is required</span>
              )}
            </div>
            <div className="justify-left flex gap-2 pb-4 pt-4 items-center">
              <input
                className="checkbox rounded-sm p-2 bg-neutral-800 checkbox-lg"
                type="checkbox"
                id="considerCoffeeInput"
                {...register("considerCoffee")}
              />
              <label htmlFor="considerCoffeeInput">
                Would you like to be considered for a coffee chat with a
                sponser?
              </label>
            </div>
            {/* <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="discoverdFromInput">Discovered From</label>
              <input
                className=""
                type="text"
                id="discoverdFromInput"
                {...register("discoverdFrom")}
              />
              {errors.discoverdFrom && (
                <span className="text-error">This field is required</span>
              )}
            </div> */}
            {/* TODO */}
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="genderInput">Gender</label>
              <input
                className="input rounded-lg bg-neutral-800 p-3 placeholder:text-neutral-500 "
                type="text"
                id="genderInput"
                {...register("gender")}
              />
              {errors.gender && (
                <span className="text-error">This field is required</span>
              )}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="raceInput">Race</label>
              <input
                className="input rounded-lg bg-neutral-800 p-3 placeholder:text-neutral-500 "
                type="text"
                id="raceInput"
                {...register("race")}
              />
              {errors.race && (
                <span className="text-error">This field is required</span>
              )}
            </div>
            <span className="pb-2 border-b-2 mb-2 border-neutral-700 text-neutral-400">
              Emergency Contact
            </span>
            <div className="flex md:gap-4 flex-col md:flex-row md:items-end">
              <div className="flex flex-col gap-2 pb-4 flex-1">
                <label htmlFor="emergencyContactNameInput">
                  Name of Emergency Contact
                </label>
                <input
                  className="input rounded-lg bg-neutral-800 p-3 placeholder:text-neutral-500 "
                  type="text"
                  id="emergencyContactNameInput"
                  {...register("emergencyContactName")}
                />
                {errors.emergencyContactName && (
                  <span>This field is required</span>
                )}
              </div>
              <div className="flex flex-col gap-2 pb-4 flex-1">
                <label htmlFor="emergencyContactRelationInput">Relation</label>
                <input
                  className="input rounded-lg bg-neutral-800 p-3 placeholder:text-neutral-500 "
                  type="text"
                  id="emergencyContactRelationInput"
                  {...register("emergencyContactRelation")}
                />
                {errors.emergencyContactRelation && (
                  <span>This field is required</span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="emergencyContactPhoneInput">Phone</label>
              <input
                className="input rounded-lg bg-neutral-800 p-3 placeholder:text-neutral-500 "
                type="text"
                id="emergencyContactPhoneInput"
                {...register("emergencyContactPhone")}
              />
              {errors.emergencyContactPhone && (
                <span>This field is required</span>
              )}
            </div>

            <span className="pb-2 border-b-2 mb-2 border-neutral-700 text-neutral-400">
              MLH Consent
            </span>
            <div className="justify-left flex gap-2 pb-4 pt-4 items-center">
              <input
                className="checkbox rounded-sm p-2 bg-neutral-800 checkbox-lg"
                type="checkbox"
                id="agreeToMLHCodeOfConductInput"
                {...register("agreeToMLHCodeOfConduct")}
              />
              <label htmlFor="agreeToMLHCodeOfConductInput">
                Agree to MLH Code of Conduct
              </label>
            </div>
            <div className="justify-left flex gap-2 pb-4 pt-4 items-center">
              <input
                className="checkbox rounded-sm p-2 bg-neutral-800 checkbox-lg"
                type="checkbox"
                id="agreeToMLHPrivacyPolicyInput"
                {...register("agreeToMLHPrivacyPolicy")}
              />
              <label htmlFor="agreeToMLHPrivacyPolicyInput">
                Agree to MLH Privacy Policy
              </label>
            </div>
            <div className="justify-left flex gap-2 pb-4 pt-4 items-center">
              <input
                className="checkbox rounded-sm p-2 bg-neutral-800 checkbox-lg"
                type="checkbox"
                id="agreeToMLHCommunicationsInput"
                {...register("agreeToMLHCommunications")}
              />
              <label htmlFor="agreeToMLHCommunicationsInput">
                Agree to MLH Communications
              </label>
            </div>
            <button type="submit" className="btn btn-primary mt-4 mb-4">
              Submit
            </button>
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
