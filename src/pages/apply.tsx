import type { GetServerSidePropsContext, NextPage } from "next";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { prisma } from "../server/db/client";
import { trpc } from "../utils/trpc";
import { useRouter } from "next/router";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import FormTextInput from "../components/FormTextInput";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Head from "next/head";
import Link from "next/link";
import { Drawer } from "../components/NavBar";
import { useEffect } from "react";
import UniversitySelect from "../components/UniversitySelect";

// export type Inputs = {
//   name: string;
// };

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  birthday: z.date(),
  studyEnrolledPostSecondary: z.boolean(),
  studyLocation: z.string().min(1),
  studyDegree: z.string().min(1),
  studyMajor: z.string().min(1),
  studyYearOfStudy: z.coerce.number().int().min(1),
  studyExpectedGraduation: z.date(),
  previousHackathonsCount: z.coerce.number().int().min(0),
  longAnswerChange: z.string().min(1),
  longAnswerExperience: z.string().min(1),
  longAnswerTech: z.string().min(1),

  longAnswerMagic: z.string().min(1),
  socialText: z
    .string()
    .transform((string) => string ?? null)
    .nullable(),
  interests: z
    .string()
    .transform((string) => string ?? null)
    .nullable(),
  tshirtSize: z.enum(["XS", "S", "M", "L", "XL"]),
  hackerKind: z.string().min(1),
  alreadyHaveTeam: z.boolean(),
  workshopChoices: z.string().array().min(1),
  considerCoffee: z.boolean(),
  discoverdFrom: z.string().min(1),
  gender: z.string().min(1),
  race: z.string().min(1),
  emergencyContactName: z.string().min(1),
  emergencyContactPhone: z.string().min(1),
  emergencyContactRelation: z.string().min(1),
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
    control,
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
        <div className="w-1/2 max-w-4xl mx-auto text-white">
          <h1 className="py-8 text-4xl font-bold">Apply to DeltaHacks</h1>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col pb-8 mx-auto"
          >
            <span className="pb-2 mb-2 border-b-2 border-neutral-700 text-neutral-400">
              Personal Information
            </span>
            <div className="flex w-full gap-4">
              <div className="flex flex-col flex-1 gap-2 pb-4">
                <label htmlFor="firstNameInput">First Name</label>
                <input
                  className="p-3 rounded-lg input bg-neutral-800 placeholder:text-neutral-500 "
                  type="text"
                  id="firstNameInput"
                  placeholder="John"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <span className="text-error">This field is required</span>
                )}
              </div>
              <div className="flex flex-col flex-1 gap-2 pb-4">
                <label htmlFor="lastNameInput">Last Name</label>
                <input
                  className="p-3 rounded-lg input bg-neutral-800 placeholder:text-neutral-500 "
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
                className="p-3 rounded-lg input bg-neutral-800 placeholder:text-neutral-500 "
                type="date"
                id="birthdayInput"
                {...register("birthday", { valueAsDate: true })}
              />
              {errors.birthday && (
                <span className="text-error">This field is required</span>
              )}
            </div>
            <span className="pb-2 mb-2 border-b-2 border-neutral-700 text-neutral-400">
              Education
            </span>
            <div className="flex items-center gap-2 pt-4 pb-4 justify-left">
              <input
                className="p-2 rounded-sm checkbox bg-neutral-800 checkbox-lg"
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
              {/* <input
                className="p-3 rounded-lg input bg-neutral-800 placeholder:text-neutral-500 "
                type="text"
                id="studyLocationInput"
                {...register("studyLocation")}
              /> */}
              <Controller
                name="studyLocation"
                control={control}
                render={({ field, fieldState }) => (
                  <UniversitySelect {...field} />
                )}
              />
              {errors.studyLocation && (
                <span className="text-error">This field is required</span>
              )}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="studyDegreeInput">Study Degree</label>
              <input
                className="p-3 rounded-lg input bg-neutral-800 placeholder:text-neutral-500 "
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
                className="p-3 rounded-lg input bg-neutral-800 placeholder:text-neutral-500 "
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
                className="p-3 rounded-lg input bg-neutral-800 placeholder:text-neutral-500 "
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
                className="p-3 rounded-lg input bg-neutral-800 placeholder:text-neutral-500 "
                type="date"
                id="studyExpectedGraduationInput"
                {...(register("studyExpectedGraduation"),
                { valueAsDate: true })}
              />
              {errors.studyExpectedGraduation && (
                <span className="text-error">This field is required</span>
              )}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="previousHackathonsCountInput">
                Previous Hackathons Count
              </label>
              <input
                className="p-3 rounded-lg input bg-neutral-800 placeholder:text-neutral-500 "
                type="number"
                id="previousHackathonsCountInput"
                {...register("previousHackathonsCount")}
              />
              {errors.previousHackathonsCount && (
                <span className="text-error">This field is required</span>
              )}
            </div>
            <span className="pb-2 mb-2 border-b-2 border-neutral-700 text-neutral-400">
              Long Answer
            </span>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="longAnswerChangeInput">
                DeltaHacks is the annual Hackathon for Change. If you had the
                ability to change anything in the world, what would it be and
                why?
              </label>
              <textarea
                className="p-3 textarea textarea-bordered bg-neutral-800 placeholder:text-neutral-500"
                id="longAnswerChangeInput"
                {...register("longAnswerChange")}
              />
              {errors.longAnswerChange && (
                <span className="text-error">This field is required</span>
              )}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="longAnswerExperienceInput">
                How do you hope to make the most out of your experience at DH10?
              </label>
              <textarea
                className="p-3 textarea textarea-bordered bg-neutral-800 placeholder:text-neutral-500"
                id="longAnswerExperienceInput"
                {...register("longAnswerExperience")}
              />
              {errors.longAnswerExperience && (
                <span className="text-error">This field is required</span>
              )}
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="longAnswerTechInput">
                Which piece of future technology excites you most and where do
                you see it going?
              </label>
              <textarea
                className="p-3 textarea textarea-bordered bg-neutral-800 placeholder:text-neutral-500"
                id="longAnswerTechInput"
                {...register("longAnswerTech")}
              />
              {errors.longAnswerTech && (
                <span className="text-error">This field is required</span>
              )}
            </div>

            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="longAnswerMagicInput">
                You've been transported to an island with no clue of where you
                are. You are allowed 3 objectsof your choice which will
                magically appear in front of you. How would you escape the
                island in time for DeltaHacks 10?
              </label>
              <textarea
                className="p-3 textarea textarea-bordered bg-neutral-800 placeholder:text-neutral-500"
                id="longAnswerMagicInput"
                {...register("longAnswerMagic")}
              />
              {errors.longAnswerMagic && (
                <span className="text-error">This field is required</span>
              )}
            </div>
            <span className="pb-2 mb-2 border-b-2 border-neutral-700 text-neutral-400">
              Survey
            </span>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="socialTextInput">
                What are your social media link(s)?{" "}
                <i>
                  <span className="text-neutral-400"> (Optional)</span>
                </i>
              </label>
              <input
                className="p-3 rounded-lg input bg-neutral-800 placeholder:text-neutral-500 "
                type="text"
                id="socialTextInput"
                {...register("socialText")}
              />
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="interestsInput">
                Is there anything else interesting you want us to know or see?
                <i>
                  <span className="text-neutral-400"> (Optional)</span>
                </i>
              </label>
              <input
                className="p-3 rounded-lg input bg-neutral-800 placeholder:text-neutral-500 "
                type="text"
                id="interestsInput"
                {...register("interests")}
              />
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="tshirtSizeInput">T-shirt Size</label>
              <input
                className="p-3 rounded-lg input bg-neutral-800 placeholder:text-neutral-500 "
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
                className="p-3 rounded-lg input bg-neutral-800 placeholder:text-neutral-500 "
                type="text"
                id="hackerKindInput"
                {...register("hackerKind")}
              />
              {errors.hackerKind && (
                <span className="text-error">This field is required</span>
              )}
            </div>
            <div className="flex items-center gap-2 pt-4 pb-4 justify-left">
              <input
                className="p-2 rounded-sm checkbox"
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
            <div className="flex items-center gap-2 pt-4 pb-4 justify-left">
              <input
                className="p-2 rounded-sm checkbox bg-neutral-800 checkbox-lg"
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
                className="p-3 rounded-lg input bg-neutral-800 placeholder:text-neutral-500 "
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
                className="p-3 rounded-lg input bg-neutral-800 placeholder:text-neutral-500 "
                type="text"
                id="raceInput"
                {...register("race")}
              />
              {errors.race && (
                <span className="text-error">This field is required</span>
              )}
            </div>
            <span className="pb-2 mb-2 border-b-2 border-neutral-700 text-neutral-400">
              Emergency Contact
            </span>
            <div className="flex flex-col md:gap-4 md:flex-row md:items-end">
              <div className="flex flex-col flex-1 gap-2 pb-4">
                <label htmlFor="emergencyContactNameInput">
                  Name of Emergency Contact
                </label>
                <input
                  className="p-3 rounded-lg input bg-neutral-800 placeholder:text-neutral-500 "
                  type="text"
                  id="emergencyContactNameInput"
                  {...register("emergencyContactName")}
                />
                {errors.emergencyContactName && (
                  <span className="text-error">This field is required</span>
                )}
              </div>
              <div className="flex flex-col flex-1 gap-2 pb-4">
                <label htmlFor="emergencyContactRelationInput">Relation</label>
                <input
                  className="p-3 rounded-lg input bg-neutral-800 placeholder:text-neutral-500 "
                  type="text"
                  id="emergencyContactRelationInput"
                  {...register("emergencyContactRelation")}
                />
                {errors.emergencyContactRelation && (
                  <span className="text-error">This field is required</span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 pb-4">
              <label htmlFor="emergencyContactPhoneInput">Phone</label>
              <input
                className="p-3 rounded-lg input bg-neutral-800 placeholder:text-neutral-500 "
                type="text"
                id="emergencyContactPhoneInput"
                {...register("emergencyContactPhone")}
              />
              {errors.emergencyContactPhone && (
                <span className="text-error">This field is required</span>
              )}
            </div>

            <span className="pb-2 mb-2 border-b-2 border-neutral-700 text-neutral-400">
              MLH Consent
            </span>
            <div className="flex items-center gap-2 pt-4 pb-4 justify-left">
              <input
                className="p-2 rounded-sm checkbox bg-neutral-800 checkbox-lg"
                type="checkbox"
                id="agreeToMLHCodeOfConductInput"
                {...register("agreeToMLHCodeOfConduct")}
              />
              <label htmlFor="agreeToMLHCodeOfConductInput">
                Agree to MLH Code of Conduct
              </label>
            </div>
            <div className="flex items-center gap-2 pt-4 pb-4 justify-left">
              <input
                className="p-2 rounded-sm checkbox bg-neutral-800 checkbox-lg"
                type="checkbox"
                id="agreeToMLHPrivacyPolicyInput"
                {...register("agreeToMLHPrivacyPolicy")}
              />
              <label htmlFor="agreeToMLHPrivacyPolicyInput">
                Agree to MLH Privacy Policy
              </label>
            </div>
            <div className="flex items-center gap-2 pt-4 pb-4 justify-left">
              <input
                className="p-2 rounded-sm checkbox bg-neutral-800 checkbox-lg"
                type="checkbox"
                id="agreeToMLHCommunicationsInput"
                {...register("agreeToMLHCommunications")}
              />
              <label htmlFor="agreeToMLHCommunicationsInput">
                Agree to MLH Communications
              </label>
            </div>
            <button type="submit" className="mt-4 mb-4 btn btn-primary">
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
