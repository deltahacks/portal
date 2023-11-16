import type { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import { z } from "zod";
import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Head from "next/head";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import useFormPersist from "react-hook-form-persist";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { prisma } from "../server/db/client";
import { trpc } from "../utils/trpc";
import { Drawer } from "../components/NavBar";
import applicationSchema from "../schemas/application";
import CustomSelect from "../components/CustomSelect";
import {
  workshops,
  tshirtSizes,
  hackerTypes,
  genderTypes,
  universities,
  majors,
  ethnicities,
  degrees,
  studyYears,
  heardFrom,
  SelectChoice,
  workshopType,
} from "../data/applicationSelectData";

export type InputsType = z.infer<typeof applicationSchema>;
const pt = applicationSchema.partial();
type ApplyFormAutofill = z.infer<typeof pt>;

const sanitizeDateString = (date: string) => {
  return new Date(date).toISOString().slice(0, 10);
};

const ApplyForm = ({ autofillData }: { autofillData: ApplyFormAutofill }) => {
  // check if autofill was an empty object
  const wasAutofilled = !(Object.keys(autofillData).length === 0);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InputsType>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      ...autofillData,
    },
  });

  const router = useRouter();

  const { mutateAsync: submitAppAsync } =
    trpc.application.submitDh10.useMutation();

  useFormPersist("applyForm", {
    watch,
    setValue,
    storage: localStorage,
  });

  const onSubmit: SubmitHandler<InputsType> = async (data) => {
    const processed = applicationSchema.parse(data);

    await submitAppAsync(processed);
    await router.push("/dashboard");
  };

  const isSecondary = watch("studyEnrolledPostSecondary");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto flex flex-col pb-8"
    >
      {wasAutofilled && (
        <div className="alert alert-success mb-4 justify-normal text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="h-6 w-6 shrink-0 stroke-current"
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
      <div className="flex w-full flex-col lg:flex-row lg:gap-4">
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
          max={sanitizeDateString(new Date().toString())}
          {...register("birthday", {})}
          placeholder="YYYY-MM-DD"
        />
        {errors.birthday && (
          <span className="text-error">{errors.birthday.message}</span>
        )}
      </div>
      <div className="flex flex-col gap-2 pb-4">
        <label className="text-black dark:text-white" htmlFor="birthdayInput">
          Link to Resume
          <span className="text-neutral-400"> (Optional)</span>
        </label>
        <input
          className="input rounded-lg bg-neutral-400 p-3 text-black placeholder:text-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500 "
          type="text"
          id="linkToResume"
          placeholder="https://example.com/resume.pdf"
          {...register("linkToResume")}
        />
        {errors.linkToResume && (
          <span className="text-error">{errors.linkToResume.message}</span>
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
              render={({ field: { onChange, value } }) => (
                <CustomSelect
                  options={universities}
                  onChange={(val: SelectChoice | null) => onChange(val?.value)}
                  value={universities.find((val) => val.value === value)}
                  defaultInputValue={autofillData.studyLocation ?? undefined}
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
            <Controller
              name="studyDegree"
              control={control}
              render={({ field: { onChange, value } }) => (
                <CustomSelect
                  options={degrees}
                  onChange={(val: SelectChoice | null) => onChange(val?.value)}
                  value={degrees.find((val) => val.value === value)}
                  defaultInputValue={autofillData.studyDegree ?? undefined}
                />
              )}
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
            <Controller
              name="studyMajor"
              control={control}
              render={({ field: { onChange, value } }) => (
                <CustomSelect
                  options={majors}
                  onChange={(val: SelectChoice | null) => onChange(val?.value)}
                  value={majors.find((val) => val.value === value)}
                  isMulti={false}
                  defaultInputValue={autofillData.studyMajor ?? undefined}
                />
              )}
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
            <Controller
              name="studyYearOfStudy"
              control={control}
              render={({ field: { onChange, value } }) => (
                <CustomSelect
                  options={studyYears}
                  onChange={(val: SelectChoice | null) => onChange(val?.value)}
                  value={studyYears.find((val) => val.value === value)}
                  isMulti={false}
                />
              )}
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
              {...register("studyExpectedGraduation")}
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
          min="0"
          id="previousHackathonsCountInput"
          {...register("previousHackathonsCount")}
          onWheel={(e) => {
            e.preventDefault();
          }}
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
        <Controller
          name="tshirtSize"
          control={control}
          render={({ field: { onChange, value } }) => (
            <CustomSelect
              options={tshirtSizes}
              onChange={(val: SelectChoice | null) => onChange(val?.value)}
              value={tshirtSizes.find((val) => val.value === value)}
              isMulti={false}
              defaultInputValue={autofillData.tshirtSize ?? undefined}
            />
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
          render={({ field: { onChange, value } }) => (
            <CustomSelect
              options={hackerTypes}
              onChange={(val: SelectChoice | null) => onChange(val?.value)}
              value={hackerTypes.find((val) => val.value === value)}
              isMulti={false}
              defaultInputValue={autofillData.hackerKind ?? undefined}
            />
          )}
        />
        {errors.hackerKind && (
          <span className="text-error">{errors.hackerKind.message}</span>
        )}
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
          render={({ field: { onChange, value } }) => (
            <CustomSelect
              options={workshops}
              onChange={(val: SelectChoice[] | null) =>
                onChange(val?.map((v: SelectChoice) => v.value))
              }
              value={workshops.filter((val) =>
                value?.includes(val.value as workshopType)
              )}
              isMulti={true}
            />
          )}
        />

        {errors.workshopChoices && (
          <span className="text-error">{errors.workshopChoices.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-2 pb-4">
        <label
          className="dark:text-white text-black"
          htmlFor="discoverdFromInput"
        >
          How did you hear about DeltaHacks?
        </label>
        <Controller
          name="discoverdFrom"
          control={control}
          render={({ field: { onChange, value } }) => (
            <CustomSelect
              options={heardFrom}
              onChange={(val: SelectChoice[] | null) =>
                onChange(val?.map((v: SelectChoice) => v.value))
              }
              value={heardFrom.filter((val) => value?.includes(val.value))}
              isMulti={true}
            />
          )}
        />
        {errors.discoverdFrom && (
          <span className="text-error">{errors.discoverdFrom.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-2 pb-4">
        <label className="text-black dark:text-white" htmlFor="genderInput">
          Gender
        </label>

        <Controller
          name="gender"
          control={control}
          render={({ field: { onChange, value } }) => (
            <CustomSelect
              options={genderTypes}
              isMulti={false}
              onChange={(val: SelectChoice | null) => onChange(val?.value)}
              value={genderTypes.find((val) => val.value === value)}
            />
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

        <Controller
          name="race"
          control={control}
          render={({ field: { onChange, value } }) => (
            <CustomSelect
              options={ethnicities}
              onChange={(val: SelectChoice | null) => onChange(val?.value)}
              value={ethnicities.find((val) => val.value === value)}
              defaultInputValue={autofillData.race ?? undefined}
            />
          )}
        />
        {errors.race && (
          <span className="text-error">{errors.race.message}</span>
        )}
      </div>

      <div className="justify-left flex items-center gap-2 pb-4 pt-4">
        <input
          className="checkbox checkbox-lg rounded-sm bg-neutral-400 p-2 dark:bg-neutral-800"
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
        {errors.agreeToMLHCodeOfConduct && (
          <span className="text-error">
            {errors.agreeToMLHCodeOfConduct.message}
          </span>
        )}
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
        {errors.agreeToMLHPrivacyPolicy && (
          <span className="text-error">
            {errors.agreeToMLHPrivacyPolicy.message}
          </span>
        )}
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
          Agree to MLH Communications{" "}
          <span className="text-neutral-400">(Optional)</span>
        </label>
      </div>
      <button type="submit" className="btn btn-primary mb-4 mt-4">
        Submit
      </button>
    </form>
  );
};

const Apply: NextPage = () => {
  // check if there is local storage data for autofill

  const autofillData = trpc.application.getPrevAutofill.useQuery(undefined, {
    retry: false,
  });

  return (
    <>
      <Head>
        <title>Welcome - DeltaHacks X</title>
      </Head>
      <Drawer>
        <div className="w-full">
          <div className="mx-auto p-4 md:p-0 md:w-1/2 max-w-4xl text-black dark:text-white">
            <h1 className="py-8 text-4xl font-bold text-black dark:text-white text-center md:text-left">
              Apply to DeltaHacks X
            </h1>

            {autofillData.isLoading ? (
              <div className="h-full py-4 flex flex-col items-center justify-center text-center">
                Loading your application...
                <div className="loading loading-infinity loading-lg"></div>
              </div>
            ) : (
              <ApplyForm autofillData={autofillData.data ?? {}} />
            )}
          </div>
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
    include: { dh10application: true },
  });

  // If submitted then go dashboard
  if (userEntry && userEntry.dh10application !== null) {
    return { redirect: { destination: "/dashboard", permanent: false } };
  }

  return { props: {} };
};

export default Apply;
