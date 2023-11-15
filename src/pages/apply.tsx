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
import UniversitySelect from "../components/UniversitySelect";

import applicationSchema from "../schemas/application";
import React, { useEffect } from "react";
import CustomSelect from "../components/CustomSelect";

export type InputsType = z.infer<typeof applicationSchema>;
const pt = applicationSchema.partial();
type ApplyFormAutofill = z.infer<typeof pt>;

interface SelectChoice {
  value: string;
  label: string;
}

const workshops: SelectChoice[] = [
  { value: "React/Vue.js", label: "React/Vue.js" },
  { value: "Blockchain", label: "Blockchain" },
  { value: "Machine Learning", label: "Machine Learning" },
  { value: "Android Development", label: "Android Development" },
  { value: "iOS Development", label: "iOS Development" },
  { value: "Web Development", label: "Web Development" },
  { value: "Intro to AR/VR", label: "Intro to AR/VR" },
  { value: "Game Development", label: "Game Development" },
  { value: "Interview Prep", label: "Interview Prep" },
  { value: "Intro to UI/UX Design", label: "Intro to UI/UX Design" },
  { value: "Hardware Hacking", label: "Hardware Hacking" },
  {
    value: "Computer Vision with OpenCV",
    label: "Computer Vision with OpenCV",
  },
];

const tshirtSizes: SelectChoice[] = [
  { value: "XS", label: "XS" },
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
];

const hackerTypes: SelectChoice[] = [
  { value: "Front-end", label: "Front-end" },
  { value: "Back-end", label: "Back-end" },
  { value: "Design", label: "Design" },
  { value: "iOS Development", label: "iOS Development" },
  { value: "Android Development", label: "Android Development" },
  { value: "Hardware", label: "Hardware" },
  { value: "Machine Learning", label: "Machine Learning" },
  { value: "Graphics Programming", label: "Graphics Programming" },
  { value: "Data Analysis", label: "Data Analysis" },
  { value: "Game Development", label: "Game Development" },
  { value: "Writer", label: "Writer" },
  { value: "Product Manager", label: "Product Manager" },
  { value: "Other", label: "Other" },
];

const genderTypes: SelectChoice[] = [
  { value: "Man", label: "Man" },
  { value: "Woman", label: "Woman" },
  { value: "Non-binary", label: "Non-binary" },
  { value: "Transgender", label: "Transgender" },
  { value: "Prefer not to say", label: "Prefer not to say" },
];

const ApplyForm = ({ autofillData }: { autofillData: ApplyFormAutofill }) => {
  // check if autofill was an empty object
  const wasAuofilled = !(Object.keys(autofillData).length === 0);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<InputsType>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      ...autofillData,
      // THIS IS VERY VERY BAD
      // BUT I DONT KNOW HOW TO FIX IT
      // AND WE ARE RUNNING OUT OF TIME
      birthday: autofillData.birthday
        ?.toISOString()
        .slice(0, 10) as unknown as Date,
      studyExpectedGraduation: autofillData.studyExpectedGraduation
        ?.toISOString()
        .slice(0, 10) as unknown as Date,
    },
  });
  const onSubmit: SubmitHandler<InputsType> = (data) => {
    console.log(data);
    const processed = applicationSchema.parse(data);
  };
  const isSecondary = watch("studyEnrolledPostSecondary");

  console.log("Workshop Choices", watch("workshopChoices"));

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto flex flex-col pb-8"
    >
      {wasAuofilled && (
        <div className="alert alert-success mb-4 justify-normal text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          Some fields were autofilled.
        </div>
      )}
      <span className="mb-2 border-b-2 border-neutral-700 pb-2 text-neutral-600 dark:text-neutral-400">
        Personal Information
      </span>
      <div className="flex w-full gap-4">
        <div className="flex flex-1 flex-col gap-2 pb-4">
          <label
            className="text-black dark:text-white "
            htmlFor="firstNameInput"
          >
            First Name
          </label>
          <input
            className="input rounded-lg bg-neutral-400 p-3 text-black placeholder:text-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 "
            type="text"
            id="firstNameInput"
            placeholder="John"
            {...register("firstName")}
          />
          {errors.firstName && (
            <span className="text-error">{errors.firstName.message}</span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 pb-4">
          <label className="text-black dark:text-white" htmlFor="lastNameInput">
            Last Name
          </label>
          <input
            className="input rounded-lg bg-neutral-400 p-3 text-black placeholder:text-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 "
            type="text"
            id="lastNameInput"
            placeholder="Doe"
            {...register("lastName")}
          />
          {errors.lastName && (
            <span className="text-error">{errors.lastName.message}</span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 pb-4">
        <label className="text-black dark:text-white" htmlFor="birthdayInput">
          Birthday
        </label>
        <input
          className="input rounded-lg bg-neutral-400 p-3 text-neutral-600 dark:bg-neutral-800 dark:text-white "
          type="date"
          id="birthdayInput"
          // placeholder="1/1/1"
          {...register("birthday", { valueAsDate: true })}
        />
        {errors.birthday && (
          <span className="text-error">{errors.birthday.message}</span>
        )}
      </div>
      <span className="mb-2 border-b-2 border-neutral-700 pb-2 text-neutral-600 dark:text-neutral-400">
        Education
      </span>
      <div className="justify-left flex items-center gap-2 pb-4 pt-4">
        <input
          className="checkbox checkbox-lg rounded-sm bg-neutral-400 p-2 dark:bg-neutral-800"
          type="checkbox"
          id="studyEnrolledPostSecondaryInput"
          {...register("studyEnrolledPostSecondary")}
        />
        <label
          className="text-black dark:text-white"
          htmlFor="studyEnrolledPostSecondaryInput"
        >
          Are you currently enrolled in post-secondary education?
        </label>
      </div>
      {isSecondary && (
        <div>
          <div className="flex flex-col gap-2 pb-4">
            <label
              className="text-black dark:text-white"
              htmlFor="studyLocationInput"
            >
              Study Location
            </label>

            <Controller
              name="studyLocation"
              control={control}
              render={({ field }) => (
                <UniversitySelect
                  {...field}
                  defaultInputValue={autofillData.studyLocation}
                />
              )}
            />

            {errors.studyLocation && (
              <span className="text-error">{errors.studyLocation.message}</span>
            )}
          </div>
          <div className="flex flex-col gap-2 pb-4">
            <label
              className="text-black dark:text-white"
              htmlFor="studyDegreeInput"
            >
              Study Degree
            </label>
            <input
              className="input rounded-lg bg-neutral-400 p-3 text-black placeholder:text-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 "
              type="text"
              id="studyDegreeInput"
              {...register("studyDegree")}
            />
            {errors.studyDegree && (
              <span className="text-error">{errors.studyDegree.message}</span>
            )}
          </div>
          <div className="flex flex-col gap-2 pb-4">
            <label
              className="text-black dark:text-white"
              htmlFor="studyMajorInput"
            >
              Study Major
            </label>
            <input
              className="input rounded-lg bg-neutral-400 p-3 text-black placeholder:text-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 "
              type="text"
              id="studyMajorInput"
              {...register("studyMajor")}
            />
            {errors.studyMajor && (
              <span className="text-error">{errors.studyMajor.message}</span>
            )}
          </div>
          <div className="flex flex-col gap-2 pb-4">
            <label
              className="text-black dark:text-white"
              htmlFor="studyYearOfStudyInput"
            >
              Year of Study
            </label>
            <input
              className="input rounded-lg bg-neutral-400 p-3 text-black placeholder:text-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 "
              type="number"
              id="studyYearOfStudyInput"
              {...register("studyYearOfStudy")}
            />
            {errors.studyYearOfStudy && (
              <span className="text-error">
                {errors.studyYearOfStudy.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2 pb-4">
            <label
              className="text-black dark:text-white"
              htmlFor="studyExpectedGraduationInput"
            >
              Expected Graduation
            </label>
            <input
              className="input rounded-lg bg-neutral-400 p-3 text-black placeholder:text-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 "
              type="date"
              id="studyExpectedGraduationInput"
              {...register("studyExpectedGraduation", { valueAsDate: true })}
            />
            {errors.studyExpectedGraduation && (
              <span className="text-error">
                {errors.studyExpectedGraduation.message}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 pb-4">
        <label
          className="text-black dark:text-white"
          htmlFor="previousHackathonsCountInput"
        >
          Previous Hackathons Count
        </label>
        <input
          className="input rounded-lg bg-neutral-400 p-3 text-black placeholder:text-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 "
          type="number"
          id="previousHackathonsCountInput"
          {...register("previousHackathonsCount")}
        />
        {errors.previousHackathonsCount && (
          <span className="text-error">
            {errors.previousHackathonsCount.message}
          </span>
        )}
      </div>
      <span className="mb-2 border-b-2 border-neutral-700 pb-2 text-neutral-600 dark:text-neutral-400">
        Long Answer
      </span>
      <div className="flex flex-col gap-2 pb-4">
        <label
          className="text-black dark:text-white"
          htmlFor="longAnswerChangeInput"
        >
          DeltaHacks is the annual Hackathon for Change. If you had the ability
          to change anything in the world, what would it be and why?
        </label>
        <textarea
          className="textarea textarea-bordered bg-neutral-400 p-3 text-black placeholder:text-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
          id="longAnswerChangeInput"
          {...register("longAnswerChange")}
        />
        {errors.longAnswerChange && (
          <span className="text-error">{errors.longAnswerChange.message}</span>
        )}
      </div>
      <div className="flex flex-col gap-2 pb-4">
        <label
          className="text-black dark:text-white"
          htmlFor="longAnswerExperienceInput"
        >
          How do you hope to make the most out of your experience at DH10?
        </label>
        <textarea
          className="textarea textarea-bordered bg-neutral-400 p-3 text-black placeholder:text-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
          id="longAnswerExperienceInput"
          {...register("longAnswerExperience")}
        />
        {errors.longAnswerExperience && (
          <span className="text-error">
            {errors.longAnswerExperience.message}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2 pb-4">
        <label
          className="text-black dark:text-white"
          htmlFor="longAnswerTechInput"
        >
          Which piece of future technology excites you most and where do you see
          it going?
        </label>
        <textarea
          className="textarea textarea-bordered bg-neutral-400 p-3 text-black placeholder:text-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
          id="longAnswerTechInput"
          {...register("longAnswerTech")}
        />
        {errors.longAnswerTech && (
          <span className="text-error">{errors.longAnswerTech.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-2 pb-4">
        <label
          className="text-black dark:text-white"
          htmlFor="longAnswerMagicInput"
        >
          You&apos;ve been transported to an island with no clue of where you
          are. You are allowed 3 objects of your choice which will magically
          appear in front of you. How would you escape the island in time for
          DeltaHacks 10?
        </label>
        <textarea
          className="textarea textarea-bordered bg-neutral-400 p-3 text-black placeholder:text-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
          id="longAnswerMagicInput"
          {...register("longAnswerMagic")}
        />
        {errors.longAnswerMagic && (
          <span className="text-error">{errors.longAnswerMagic.message}</span>
        )}
      </div>
      <span className="mb-2 border-b-2 border-neutral-700 pb-2 text-neutral-600 dark:text-neutral-400">
        Survey
      </span>
      <div className="flex flex-col gap-2 pb-4">
        <label className="text-black dark:text-white" htmlFor="socialTextInput">
          What are your social media link(s)?{" "}
          <i>
            <span className="text-neutral-400"> (Optional)</span>
          </i>
        </label>
        <input
          className="input rounded-lg bg-neutral-400 p-3 text-black placeholder:text-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 "
          type="text"
          id="socialTextInput"
          {...register("socialText")}
        />
      </div>
      <div className="flex flex-col gap-2 pb-4">
        <label className="text-black dark:text-white" htmlFor="interestsInput">
          Is there anything else interesting you want us to know or see?
          <i>
            <span className="text-neutral-400"> (Optional)</span>
          </i>
        </label>
        <input
          className="input rounded-lg bg-neutral-400 p-3 text-black placeholder:text-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 "
          type="text"
          id="interestsInput"
          {...register("interests")}
        />
      </div>
      <div className="flex flex-col gap-2 pb-4">
        <label className="text-black dark:text-white" htmlFor="tshirtSizeInput">
          T-shirt Size
        </label>
        {/* <input
          className="input rounded-lg bg-neutral-400 p-3 text-black placeholder:text-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 "
          type="text"
          id="tshirtSizeInput"
          {...register("tshirtSize")}
        /> */}
        <Controller
          name="tshirtSize"
          control={control}
          render={({ field }) => (
            <CustomSelect options={tshirtSizes} {...field} />
          )}
        />
        {errors.tshirtSize && (
          <span className="text-error">{errors.tshirtSize.message}</span>
        )}
      </div>
      <div className="flex flex-col gap-2 pb-4">
        <label className="text-black dark:text-white" htmlFor="hackerKindInput">
          What kind of hacker are you?
        </label>
        <Controller
          name="hackerKind"
          control={control}
          render={({ field }) => (
            <CustomSelect options={hackerTypes} {...field} isMulti={true} />
          )}
        />
        {errors.hackerKind && (
          <span className="text-error">{errors.hackerKind.message}</span>
        )}
      </div>
      <div className="justify-left flex items-center gap-2 pb-4 pt-4">
        <input
          className="checkbox rounded-sm p-2"
          type="checkbox"
          id="alreadyHaveTeamInput"
          {...register("alreadyHaveTeam")}
        />
        <label
          className="text-black dark:text-white"
          htmlFor="alreadyHaveTeamInput"
        >
          Do you already have a team?
        </label>
      </div>

      <div className="flex flex-col gap-2 pb-4">
        <label
          className="text-black dark:text-white"
          htmlFor="workshopChoicesInput"
        >
          What workshops are you interested in?
        </label>
        <Controller
          name="workshopChoices"
          control={control}
          render={({ field }) => (
            <CustomSelect options={workshops} {...field} isMulti={true} />
          )}
        />
        {errors.workshopChoices && (
          <span className="text-error">{errors.workshopChoices.message}</span>
        )}
      </div>
      <div className="justify-left flex items-center gap-2 pb-4 pt-4">
        <input
          className="checkbox checkbox-lg rounded-sm bg-neutral-400 p-2 dark:bg-neutral-800"
          type="checkbox"
          id="considerCoffeeInput"
          {...register("considerCoffee")}
        />
        <label
          className="text-black dark:text-white"
          htmlFor="considerCoffeeInput"
        >
          Would you like to be considered for a coffee chat with a sponser?
        </label>
      </div>
      {/* <div className="flex flex-col gap-2 pb-4">
    <label className="dark:text-white text-black" htmlFor="discoverdFromInput">Discovered From</label>
    <input
      className=""
      type="text"
      id="discoverdFromInput"
      {...register("discoverdFrom")}
    />
    {errors.discoverdFrom && (
      <span className="text-error">{errors.discoverdFrom.message}</span>
    )}
  </div> */}
      {/* TODO */}
      <div className="flex flex-col gap-2 pb-4">
        <label className="text-black dark:text-white" htmlFor="genderInput">
          Gender
        </label>
        {/* <input
          className="input rounded-lg bg-neutral-400 p-3 text-black placeholder:text-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 "
          type="text"
          id="genderInput"
          {...register("gender")}
        /> */}
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <CustomSelect options={genderTypes} {...field} />
          )}
        />

        {errors.gender && (
          <span className="text-error">{errors.gender.message}</span>
        )}
      </div>
      <div className="flex flex-col gap-2 pb-4">
        <label className="text-black dark:text-white" htmlFor="raceInput">
          Race
        </label>
        <input
          className="input rounded-lg bg-neutral-400 p-3 text-black placeholder:text-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 "
          type="text"
          id="raceInput"
          {...register("race")}
        />
        {errors.race && (
          <span className="text-error">{errors.race.message}</span>
        )}
      </div>
      <span className="mb-2 border-b-2 border-neutral-700 pb-2 text-neutral-600 dark:text-neutral-400">
        Emergency Contact
      </span>
      <div className="flex flex-col md:flex-row md:items-end md:gap-4">
        <div className="flex flex-1 flex-col gap-2 pb-4">
          <label
            className="text-black dark:text-white"
            htmlFor="emergencyContactNameInput"
          >
            Name of Emergency Contact
          </label>
          <input
            className="input rounded-lg bg-neutral-400 p-3 text-black placeholder:text-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 "
            type="text"
            id="emergencyContactNameInput"
            {...register("emergencyContactName")}
          />
          {errors.emergencyContactName && (
            <span className="text-error">
              {errors.emergencyContactName.message}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 pb-4">
          <label
            className="text-black dark:text-white"
            htmlFor="emergencyContactRelationInput"
          >
            Relation
          </label>
          <input
            className="input rounded-lg bg-neutral-400 p-3 text-black placeholder:text-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 "
            type="text"
            id="emergencyContactRelationInput"
            {...register("emergencyContactRelation")}
          />
          {errors.emergencyContactRelation && (
            <span className="text-error">
              {errors.emergencyContactRelation.message}
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 pb-4">
        <label
          className="text-black dark:text-white"
          htmlFor="emergencyContactPhoneInput"
        >
          Phone
        </label>
        <input
          className="input rounded-lg bg-neutral-400 p-3 text-black placeholder:text-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 "
          type="text"
          id="emergencyContactPhoneInput"
          {...register("emergencyContactPhone")}
        />
        {errors.emergencyContactPhone && (
          <span className="text-error">
            {errors.emergencyContactPhone.message}
          </span>
        )}
      </div>

      <span className="mb-2 border-b-2 border-neutral-700 pb-2 text-neutral-600 dark:text-neutral-400">
        MLH Consent
      </span>
      <div className="justify-left flex items-center gap-2 pb-4 pt-4">
        <input
          className="checkbox checkbox-lg rounded-sm bg-neutral-400 p-2 dark:bg-neutral-800"
          type="checkbox"
          id="agreeToMLHCodeOfConductInput"
          {...register("agreeToMLHCodeOfConduct")}
        />
        <label
          className="text-black dark:text-white"
          htmlFor="agreeToMLHCodeOfConductInput"
        >
          Agree to MLH Code of Conduct
        </label>
      </div>
      <div className="justify-left flex items-center gap-2 pb-4 pt-4">
        <input
          className="checkbox checkbox-lg rounded-sm bg-neutral-400 p-2 dark:bg-neutral-800"
          type="checkbox"
          id="agreeToMLHPrivacyPolicyInput"
          {...register("agreeToMLHPrivacyPolicy")}
        />
        <label
          className="text-black dark:text-white"
          htmlFor="agreeToMLHPrivacyPolicyInput"
        >
          Agree to MLH Privacy Policy
        </label>
      </div>
      <div className="justify-left flex items-center gap-2 pb-4 pt-4">
        <input
          className="checkbox checkbox-lg rounded-sm bg-neutral-400 p-2 dark:bg-neutral-800"
          type="checkbox"
          id="agreeToMLHCommunicationsInput"
          {...register("agreeToMLHCommunications")}
        />
        <label
          className="text-black dark:text-white"
          htmlFor="agreeToMLHCommunicationsInput"
        >
          Agree to MLH Communications
        </label>
      </div>
      <button
        type="submit"
        className="btn btn-primary mb-4 mt-4"
        // onClick={() => console.log("AAA")}
      >
        Submit
      </button>
    </form>
  );
};

const Apply: NextPage = () => {
  const router = useRouter();
  const submitResponseId = trpc.application.submit.useMutation();
  const autofillData = trpc.application.getPrevAutofill.useQuery();

  return (
    <>
      <Head>
        <title>Welcome - DeltaHacks X</title>
      </Head>
      <Drawer>
        <div className="w-full">
          <div className="mx-auto w-1/2 max-w-4xl text-white">
            <h1 className="py-8 text-4xl font-bold text-black dark:text-white">
              Apply to DeltaHacks X
            </h1>
            {autofillData.isLoading ? (
              <h1>Loading</h1>
            ) : (
              <ApplyForm autofillData={autofillData.data ?? {}} />
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
};

import superjson from "superjson";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "../server/router";
import { createContext } from "../server/router/context";

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

  // await helpers.application.getPrevAutofill.fetch();

  return {
    props: {
      // trpcState: helpers.dehydrate(),
    },
  };
  // If submitted then go dashboard
  // if (
  //   userEntry &&
  //   (userEntry.typeform_response_id === null ||
  //     userEntry.typeform_response_id === undefined)
  // ) {
  //   return { props: {} };
  // }
  // return { redirect: { destination: "/dashboard", permanent: false } };
};

export default Apply;
