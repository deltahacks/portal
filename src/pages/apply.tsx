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
import { Drawer } from "../components/NavBar";
import { DH10ApplicationSchema } from "../../prisma/zod";
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
import { useEffect } from "react";

export type InputsType = z.infer<typeof DH10ApplicationSchema>;
const pt = DH10ApplicationSchema.partial();
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
    <div className="flex flex-1 flex-col gap-2 pb-4">
      <label className="text-black dark:text-white" htmlFor={id}>
        {label}{" "}
        {optional && (
          <span className="text-neutral-500 dark:text-neutral-400">
            (Optional)
          </span>
        )}
      </label>
      <input
        className="input rounded-lg  border-neutral-300 text-black placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
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
      <div className="flex w-full items-center justify-between gap-2 pb-4 pt-4 md:flex-row-reverse md:justify-end">
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
          className="checkbox-primary checkbox checkbox-lg rounded-sm bg-white p-2 dark:bg-neutral-800"
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
    <div className="flex flex-1 flex-col gap-2 pb-4">
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
          {150 - currentLength} words left
        </div>
      </label>
      <textarea
        className="textarea textarea-bordered rounded-lg border-neutral-300 text-black placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
        id={id}
        placeholder="Type here..."
        {...register(id)}
        {...props}
      />
      {errors && <span className="text-error">{errors.message}</span>}
    </div>
  );
};

interface FormDividerProps {
  label: string;
}

const FormDivider: React.FC<FormDividerProps> = ({ label }) => {
  return (
    <span className="my-4 border-b-2 border-neutral-700  pb-2 text-xl font-semibold text-neutral-900 dark:text-neutral-400">
      {label}
    </span>
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
    resolver: zodResolver(DH10ApplicationSchema),
    defaultValues: {
      ...autofillData,
      studyEnrolledPostSecondary: true,
    },
  });

  const router = useRouter();

  const {
    mutateAsync: submitAppAsync,
    isSuccess,
    isError,
  } = trpc.application.submitDh10.useMutation({
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
    const processed = DH10ApplicationSchema.parse(data);

    await submitAppAsync(processed);
  };

  const isSecondary = watch("studyEnrolledPostSecondary");
  const isMacEv = watch("macEv");

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

      <FormDivider label="Personal Information" />
      <div className="flex w-full flex-col lg:flex-row lg:gap-4">
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
          className="input rounded-lg border-neutral-300 text-black placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
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

      {persistId.endsWith("mcmaster.ca") && (
        <FormCheckbox
          label="Would you like to be a part of the McMaster Experience Ventures Program?"
          id="macEv"
          errors={errors.macEv}
          register={register}
        />
      )}

      {isMacEv && (
        <div>
          Please be sure to fill out this form for your application to be
          considered:{" "}
          <a
            href="https://forms.office.com/r/59eVyQ2W4T"
            className="text-blue-500"
            target="_blank"
          >
            https://forms.office.com/r/Vf8wYec5JW
          </a>
        </div>
      )}

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
              className="input rounded-lg border-neutral-300 text-black placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
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
          className="input rounded-lg border-neutral-300 text-black placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
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
        id="longAnswerChange"
        label="DeltaHacks is the annual Hackathon for Change. If you had the ability to change anything in the world, what would it be and why?"
        errors={errors.longAnswerChange}
        register={register}
        currentLength={watch("longAnswerChange")?.split(/\s/g).length ?? 0}
      />

      <FormTextArea
        id="longAnswerExperience"
        label="How do you hope to make the most out of your experience at DH10?"
        errors={errors.longAnswerChange}
        register={register}
        currentLength={watch("longAnswerExperience")?.split(/\s/g).length ?? 0}
      />

      <FormTextArea
        id="longAnswerTech"
        label="Which piece of future technology excites you most and where do you see it going?"
        errors={errors.longAnswerTech}
        register={register}
        currentLength={watch("longAnswerTech")?.split(/\s/g).length ?? 0}
      />

      <FormTextArea
        id="longAnswerMagic"
        label="You've been transported to an island with no clue of where you are. You are allowed 3 objects of your choice which will magically appear in front of you. How would you escape the island in time for DeltaHacks 10?"
        errors={errors.longAnswerMagic}
        register={register}
        currentLength={watch("longAnswerMagic")?.split(/\s/g).length ?? 0}
      />

      <FormDivider label="Survey" />

      <FormInput
        label="What are your social media links?"
        id={"socialText"}
        errors={errors.socialText}
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

      <button type="submit" className="btn btn-primary mb-4 mt-4">
        Submit
      </button>
      {isError && (
        <div className="alert alert-error mb-4 justify-normal text-center">
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
  });

  return (
    <>
      <Head>
        <title>Welcome - DeltaHacks X</title>
      </Head>
      <Drawer>
        <div className="w-full">
          <div className="mx-auto max-w-4xl p-4 text-black dark:text-white md:w-1/2 md:p-0">
            <h1 className="py-8 text-center text-4xl font-bold text-black dark:text-white md:text-left">
              Apply to DeltaHacks X
            </h1>

            {!killed &&
              (autofillData.isLoading ? (
                <div className="flex h-full flex-col items-center justify-center py-4 text-center">
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
              <div className="flex h-full flex-col items-center justify-center py-4 text-center">
                <div className="alert  bg-red-600 text-center text-2xl text-black dark:text-white md:text-left">
                  <span>
                    Applications are currently closed due to technical
                    difficulties. Please check back later. If this error
                    persists, please contact us at{" "}
                    <span className="font-bold">tech@deltahacks.com</span>
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
    include: { dh10application: true },
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
  if (userEntry && userEntry.dh10application !== null) {
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
