import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { useRouter } from "next/router";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Head from "next/head";
import {
  useForm,
  SubmitHandler,
  Controller,
  FieldError,
  UseFormRegister,
} from "react-hook-form";
import useFormPersist from "react-hook-form-persist";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { prisma } from "../server/db/client";
import { trpc } from "../utils/trpc";
import Drawer from "../components/Drawer";
import applicationSchema from "../schemas/application";
import CustomSelect from "../components/CustomSelect";
import FormDivider from "../components/FormDivider";
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
  orientations,
  represenation,
} from "../data/applicationSelectData";
import { useEffect } from "react";

export type InputsType = z.infer<typeof applicationSchema>;
const pt = applicationSchema.partial();
type ApplyFormAutofill = z.infer<typeof pt>;

interface FormInputProps {
  label: string;
  id: keyof InputsType;
  errors: FieldError | undefined;
  optional?: boolean;
  register: UseFormRegister<InputsType>;
  link?: string | undefined;
}

const FormInput: React.FC<
  FormInputProps & React.HTMLProps<HTMLInputElement>
> = ({ label, id, errors, optional, register, ...props }) => {
  return (
    <div className="flex flex-col flex-1 gap-2 pb-4">
      <label className="text-black dark:text-white" htmlFor={id}>
        {label}{" "}
        {optional && (
          <span className="text-neutral-500 dark:text-neutral-400">
            (Optional)
          </span>
        )}
      </label>
      <input
        className="text-black rounded-lg input border-neutral-300 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
        type="text"
        id={id}
        {...register(id)}
        {...props}
      />
      {errors && <span className="text-error">{errors.message}</span>}
    </div>
  );
};

const FormCheckbox: React.FC<
  FormInputProps & React.HTMLProps<HTMLInputElement>
> = ({ label, id, errors, optional, register, link, ...props }) => {
  return (
    <>
      <div className="flex items-center justify-between w-full gap-2 pt-4 pb-4 md:flex-row-reverse md:justify-end">
        <label className="text-black dark:text-white" htmlFor={id}>
          {link ? (
            <a className="underline" href={link}>
              {label}
            </a>
          ) : (
            label
          )}{" "}
          {optional && (
            <span className="text-neutral-500 dark:text-neutral-400">
              (Optional)
            </span>
          )}
        </label>
        <input
          className="p-2 bg-white rounded-sm checkbox-primary checkbox checkbox-lg dark:bg-neutral-800"
          type="checkbox"
          id={id}
          {...register(id)}
          {...props}
        />
      </div>
      {errors && <span className="text-error">{errors.message}</span>}
    </>
  );
};

const FormTextArea: React.FC<
  FormInputProps &
    React.HTMLProps<HTMLTextAreaElement> & { currentLength: number }
> = ({ label, id, errors, optional, currentLength, register, ...props }) => {
  return (
    <div className="flex flex-col flex-1 gap-2 pb-4">
      <label className="text-black dark:text-white" htmlFor={id}>
        {label}{" "}
        {optional && (
          <span className="text-neutral-500 dark:text-neutral-400">
            (Optional)
          </span>
        )}
        <div
          className={
            "pt-4 " +
            (currentLength > 150
              ? "text-red-500"
              : "text-neutral-500 dark:text-neutral-400")
          }
        >
          {150 + 1 - currentLength} words left
        </div>
      </label>
      <textarea
        className="text-black rounded-lg textarea textarea-bordered border-neutral-300 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
        id={id}
        placeholder="Type here..."
        {...register(id)}
        {...props}
      />
      {errors && <span className="text-error">{errors.message}</span>}
    </div>
  );
};

const ApplyForm = ({
  autofillData,
  persistId,
}: {
  autofillData: ApplyFormAutofill;
  persistId: string;
}) => {
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
      studyEnrolledPostSecondary: true,
      studyExpectedGraduation: null,
    },
  });

  const router = useRouter();

  const {
    mutateAsync: submitAppAsync,
    isSuccess,
    isError,
  } = trpc.application.submitDh11.useMutation({
    onSuccess: async () => {
      await router.push("/dashboard");
    },
  });

  useFormPersist(`applyForm:${persistId}`, {
    watch,
    setValue,
    storage: localStorage,
  });

  const onSubmit: SubmitHandler<InputsType> = async (data) => {
    console.log(data);
    console.log("validating");
    const processed = applicationSchema.parse(data);

    console.log("validated");

    await submitAppAsync(processed);
  };

  console.log("Errors", errors);

  const isSecondary = watch("studyEnrolledPostSecondary");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col pb-8 mx-auto"
    >
      {wasAutofilled && (
        <div className="mb-4 text-center alert alert-success justify-normal">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="w-6 h-6 stroke-current shrink-0"
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

      <FormDivider label="Personal Information" />
      <div className="flex flex-col w-full lg:flex-row lg:gap-4">
        <FormInput
          label="First Name"
          id="firstName"
          placeholder="John"
          errors={errors.firstName}
          register={register}
        />
        <FormInput
          label="Last Name"
          id="lastName"
          placeholder="Doe"
          errors={errors.lastName}
          register={register}
        />
      </div>
      {/* Birthday Input */}
      <div className="flex flex-col gap-2 pb-4">
        <label className="text-black dark:text-white" htmlFor="birthdayInput">
          Birthday
        </label>
        <input
          className="text-black rounded-lg input border-neutral-300 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
          type="date"
          id="birthdayInput"
          {...register("birthday", {})}
          placeholder="YYYY-MM-DD"
        />
        {errors.birthday && (
          <span className="text-error">{errors.birthday.message}</span>
        )}
      </div>

      <FormInput
        label="Link to Resume"
        id="linkToResume"
        placeholder="https://example.com/resume.pdf"
        errors={errors.linkToResume}
        register={register}
        optional
      />

      <FormDivider label="Education" />

      <FormCheckbox
        label="Are you currently enrolled in post-secondary education?"
        id="studyEnrolledPostSecondary"
        errors={errors.studyEnrolledPostSecondary}
        register={register}
      />

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
              className="text-black rounded-lg input border-neutral-300 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
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
          className="text-black rounded-lg input border-neutral-300 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
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

      <FormDivider label="Long Answer" />

      <FormTextArea
        id="longAnswerIncident"
        label="Describe an incident that reshaped your approach to teamwork, leadership, or maintaining a positive outlook."
        errors={errors.longAnswerIncident}
        register={register}
        currentLength={watch("longAnswerIncident")?.split(/\s/g).length ?? 0}
      />

      <FormTextArea
        id="longAnswerGoals"
        label="How will you make the most out of your experience at DeltaHacks 11, and how will attending the event help you achieve your long-term goals?"
        errors={errors.longAnswerGoals}
        register={register}
        currentLength={watch("longAnswerGoals")?.split(/\s/g).length ?? 0}
      />

      <FormTextArea
        id="longAnswerFood"
        label="What's your go-to comfort food?"
        errors={errors.longAnswerFood}
        register={register}
        currentLength={watch("longAnswerFood")?.split(/\s/g).length ?? 0}
      />

      <FormTextArea
        id="longAnswerTravel"
        label="If you could travel anywhere in the universe, where would you go and why?"
        errors={errors.longAnswerTravel}
        register={register}
        currentLength={watch("longAnswerTravel")?.split(/\s/g).length ?? 0}
      />

      <FormTextArea
        id="longAnswerSocratica"
        label="If you did not have to worry about school/money/time, what is the one thing you would work on?"
        errors={errors.longAnswerSocratica}
        register={register}
        currentLength={watch("longAnswerSocratica")?.split(/\s/g).length ?? 0}
      />

      <FormDivider label="Survey" />

      <FormInput
        label="What are your social media links?"
        id={"socialText"}
        errors={errors?.socialText && errors.socialText[0]}
        register={register}
        optional
      />

      <FormTextArea
        label="Is there anything else interesting you want us to know or see?"
        id={"interests"}
        errors={errors.interests}
        register={register}
        currentLength={watch("interests")?.split(/\s/g).length ?? 0}
        optional
      />

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
              onChange={(val: SelectChoice[] | null) =>
                onChange(val?.map((v: SelectChoice) => v.value))
              }
              value={hackerTypes.filter((val) => value?.includes(val.value))}
              isMulti={true}
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
          className="text-black dark:text-white"
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
        <label
          className="text-black dark:text-white"
          htmlFor="underrepresentedInput"
        >
          Do you identify as part of an underrepresented group in the technology
          industry?
        </label>

        <Controller
          name="underrepresented"
          control={control}
          render={({ field: { onChange, value } }) => (
            <CustomSelect
              options={represenation}
              isMulti={false}
              onChange={(val: SelectChoice | null) => onChange(val?.value)}
              value={represenation.find((val) => val.value === value)}
            />
          )}
        />

        {errors.gender && (
          <span className="text-error">{errors.gender.message}</span>
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
        <label
          className="text-black dark:text-white"
          htmlFor="orientationInput"
        >
          Orientation
        </label>

        <Controller
          name="orientation"
          control={control}
          render={({ field: { onChange, value } }) => (
            <CustomSelect
              options={orientations}
              isMulti={false}
              onChange={(val: SelectChoice | null) => onChange(val?.value)}
              value={orientations.find((val) => val.value === value)}
            />
          )}
        />

        {errors.orientation && (
          <span className="text-error">{errors.orientation.message}</span>
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

      <FormCheckbox
        label="Do you already have a team?"
        id="alreadyHaveTeam"
        errors={errors.alreadyHaveTeam}
        register={register}
      />

      <FormCheckbox
        label="Would you like to be considered for a coffee chat with a sponser?"
        id="considerCoffee"
        errors={errors.considerCoffee}
        register={register}
      />

      <FormDivider label="Emergency Contact" />

      <div className="flex flex-col md:flex-row md:items-end md:gap-4">
        <FormInput
          label="Name of Emergency Contact"
          id="emergencyContactName"
          errors={errors.emergencyContactName}
          placeholder="James Doe"
          register={register}
        />
        <FormInput
          label="Relation to Emergency Contact"
          id="emergencyContactRelation"
          errors={errors.emergencyContactName}
          placeholder="Parent / Guardian / Friend / Spouse"
          register={register}
        />
      </div>
      <FormInput
        id="emergencyContactPhone"
        label="Emergency Contact Phone Number"
        errors={errors.emergencyContactPhone}
        placeholder="000-000-0000"
        register={register}
      />

      <FormDivider label="MLH Consent" />

      <FormCheckbox
        label="Agree to MLH Code of Conduct"
        id="agreeToMLHCodeOfConduct"
        errors={errors.agreeToMLHCodeOfConduct}
        register={register}
        link="https://static.mlh.io/docs/mlh-code-of-conduct.pdf"
      />

      <FormCheckbox
        label="Agree to MLH Privacy Policy"
        id="agreeToMLHPrivacyPolicy"
        errors={errors.agreeToMLHPrivacyPolicy}
        register={register}
        link="https://mlh.io/privacy"
      />

      <FormCheckbox
        label="Agree to MLH Communications"
        id="agreeToMLHCommunications"
        errors={errors.agreeToMLHCommunications}
        register={register}
        optional
      />

      <button type="submit" className="mt-4 mb-4 btn btn-primary">
        Submit
      </button>
      {isError && (
        <div className="mb-4 text-center alert alert-error justify-normal">
          There was an error submitting your application. Please try again. If
          this error persists, please contact us at tech@deltahacks.com
        </div>
      )}
    </form>
  );
};

const Apply: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ email, killed }) => {
  // delete all local storage applyForm keys
  // that are not the current user's
  useEffect(() => {
    if (typeof window !== "undefined") {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("applyForm:") && key !== `applyForm:${email}`) {
          localStorage.removeItem(key);
        }
      }
    }
  }, [email]);

  const autofillData = trpc.application.getPrevAutofill.useQuery(undefined, {
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return (
    <>
      <Head>
        <title>Welcome - DeltaHacks XI</title>
      </Head>
      <Drawer>
        <div className="w-full">
          <div className="max-w-4xl p-4 mx-auto text-black dark:text-white md:w-1/2 md:p-0">
            <h1 className="py-8 text-4xl font-bold text-center text-black dark:text-white md:text-left">
              Apply to DeltaHacks XI
            </h1>

            {!killed &&
              (autofillData.isLoading ? (
                <div className="flex flex-col items-center justify-center h-full py-4 text-center">
                  Loading your application...
                  <div className="loading loading-infinity loading-lg"></div>
                </div>
              ) : (
                <ApplyForm
                  persistId={email ?? "default"}
                  autofillData={autofillData.data ?? {}}
                />
              ))}

            {killed && (
              <div className="flex flex-col items-center justify-center h-full py-4 text-center">
                <div className="text-2xl text-center text-black bg-red-600 alert dark:text-white md:text-left">
                  {/* <span>
                    Applications are currently closed due to technical
                    difficulties. Please check back later. If this error
                    persists, please contact us at{" "}
                    <span className="font-bold">tech@deltahacks.com</span>
                  </span> */}
                  <span>
                    Applications are closed for DeltaHacks XI. If you did not
                    get to apply, we hope to see you next year!
                  </span>
                </div>
              </div>
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
    include: { DH11Application: true },
  });

  const killedStr = await prisma.config.findFirst({
    where: { name: "killApplications" },
    select: { value: true },
  });

  // they are killed in all cases unless the value is "false"
  let killed = true;

  if (killedStr && JSON.parse(killedStr.value) === false) {
    killed = false;
  }

  // If submitted then go dashboard
  if (userEntry && userEntry.DH11Application !== null) {
    return { redirect: { destination: "/dashboard", permanent: false } };
  }

  console.log(killedStr, killed);
  return {
    props: {
      email: session.user.email,
      killed: killed,
    },
  };
};

export default Apply;
