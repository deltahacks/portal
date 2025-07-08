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
  representation,
} from "../data/applicationSelectData";
import { iso31661 } from "iso-3166";

import React, { useEffect, useId, useState } from "react";
import SocialLinksFormInput from "../components/SocialLinkFormInput";
import Uppy from "@uppy/core";
import { Dashboard } from "@uppy/react";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import XHR from "@uppy/xhr-upload";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import FormInput from "../components/CustomInput";

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

const FormCheckbox: React.FC<
  FormInputProps & React.HTMLProps<HTMLInputElement>
> = ({ label, id, errors, optional, register, link, ...props }) => {
  return (
    <>
      <div className="flex items-center justify-between w-full gap-2 pt-4 pb-4 md:flex-row-reverse md:justify-end">
        <label className="text-black dark:text-white" htmlFor={id}>
          {link ? (
            <a className="underline" href={link} target="_blank">
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
    React.HTMLProps<HTMLTextAreaElement> & {
      value: string;
    }
> = ({ label, id, errors, optional, value, register, ...props }) => {
  const wordLength = value?.trim()?.split(/\s/g).length ?? 0;
  const currentLength = value?.trim()?.length ?? 0;
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
            (wordLength > 150
              ? "text-red-500"
              : "text-neutral-500 dark:text-neutral-400")
          }
        >
          {151 - wordLength - (currentLength > 0 ? 1 : 0)} words left
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

interface FormUploadProps {
  uploadUrl: string;
  objectId: string;
  setUploadValue: (value: string) => void;
}

const FormUpload: React.FC<FormUploadProps> = ({
  uploadUrl,
  objectId,
  setUploadValue,
}) => {
  const { theme } = useTheme();

  const id = useId();
  const [uppy] = useState(() =>
    new Uppy({
      id: id,
      allowMultipleUploadBatches: false,
      autoProceed: true,
      restrictions: {
        maxNumberOfFiles: 1,
        maxFileSize: 1024 * 1024 * 5, // 5 MB
        allowedFileTypes: [".pdf"],
      },
      locale: {
        strings: {
          done: "Reset",
        },
        pluralize: (n: number) => n,
      },
    }).use(XHR, {
      endpoint: uploadUrl,
      formData: false,
      method: "PUT",
      onAfterResponse: () => {
        setUploadValue(objectId);
      },
      getResponseData: () => {
        return { url: objectId };
      },
    }),
  );

  if (!uploadUrl) {
    return (
      <div className="flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 gap-2 pb-4">
      <div className="text-black dark:text-white">
        Resume{" "}
        <span className="text-neutral-500 dark:text-neutral-400">
          (Optional)
        </span>
      </div>
      <Dashboard
        uppy={uppy}
        height={200}
        doneButtonHandler={() => {
          uppy.resetProgress();
        }}
        theme={theme === "dark" ? "dark" : "light"}
      />
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

  useFormPersist(`dh11-applyForm:${persistId}`, {
    watch,
    setValue,
    storage: localStorage,
  });

  const [uploadUrl, setUploadUrl] = useState<string | null>(null);

  const { mutate, data } = trpc.file.getUploadUrl.useMutation({
    onSuccess: (data) => {
      setUploadUrl(data?.url);
    },
  });

  const user = useSession();

  const objectId = `${user.data?.user?.id}-dh11.pdf`;
  useEffect(() => {
    mutate({
      filename: objectId,
      contentType: "application/pdf",
    });
  }, []);

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

      <FormInput
        id="phone"
        label="Phone Number"
        errors={errors.phone}
        placeholder="000-000-0000"
        register={register}
      />

      <div className="flex flex-col gap-2 pb-4">
        <label className="text-black dark:text-white" htmlFor="tshirtSizeInput">
          Country of Residence
        </label>
        <Controller
          name="country"
          control={control}
          render={({ field: { onChange, value } }) => (
            <CustomSelect
              options={[
                { value: "Canada", label: "Canada" },
                ...iso31661
                  .filter((e) => e.name !== "Canada")
                  .map((e) => ({ value: e.name, label: e.name }))
                  .sort((a, b) => a.value.localeCompare(b.value)),
              ]}
              onChange={(val: SelectChoice | null) => onChange(val?.value)}
              // value={iso3115.find((val) => val.value === value)}
              isMulti={false}
              defaultInputValue={autofillData.tshirtSize ?? undefined}
            />
          )}
        />
        {errors.tshirtSize && (
          <span className="text-error">{errors.tshirtSize.message}</span>
        )}
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
      {uploadUrl ? (
        <FormUpload
          uploadUrl={uploadUrl}
          objectId={objectId}
          setUploadValue={(v) => setValue("linkToResume", v)}
        />
      ) : (
        <div></div>
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
              <span className="text-neutral-500 dark:text-neutral-400">
                (Optional)
              </span>
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
              <span className="text-neutral-500 dark:text-neutral-400">
                (Optional)
              </span>
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
              <span className="text-neutral-500 dark:text-neutral-400">
                (Optional)
              </span>
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
              <span className="text-neutral-500 dark:text-neutral-400">
                (Optional)
              </span>
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
              <span className="text-neutral-500 dark:text-neutral-400">
                (Optional)
              </span>
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
          Previous Hackathons Count{" "}
          <span className="text-neutral-500 dark:text-neutral-400">
            (Optional)
          </span>
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
        value={watch("longAnswerIncident")}
      />
      <FormTextArea
        id="longAnswerGoals"
        label="How will you make the most out of your experience at DeltaHacks 11, and how will attending the event help you achieve your long-term goals?"
        errors={errors.longAnswerGoals}
        register={register}
        value={watch("longAnswerGoals")}
      />
      <FormTextArea
        id="longAnswerFood"
        label="What's your go-to comfort food?"
        errors={errors.longAnswerFood}
        register={register}
        value={watch("longAnswerFood")}
      />
      <FormTextArea
        id="longAnswerTravel"
        label="If you could travel anywhere in the universe, where would you go and why?"
        errors={errors.longAnswerTravel}
        register={register}
        value={watch("longAnswerTravel")}
      />
      <FormTextArea
        id="longAnswerSocratica"
        label="If you did not have to worry about school/money/time, what is the one thing you would work on?"
        errors={errors.longAnswerSocratica}
        register={register}
        value={watch("longAnswerSocratica")}
      />
      <FormDivider label="Survey" />
      <SocialLinksFormInput register={register} errors={errors} watch={watch} />
      <FormTextArea
        label="Is there anything else interesting you want us to know or see?"
        id={"interests"}
        errors={errors.interests}
        register={register}
        value={watch("interests") ?? ""}
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
                value?.includes(val.value as workshopType),
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
      <FormCheckbox
        label="Do you already have a team?"
        id="alreadyHaveTeam"
        errors={errors.alreadyHaveTeam}
        register={register}
      />
      <FormCheckbox
        label="Would you like to be considered for a coffee chat with a sponsor?"
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
          errors={errors.emergencyContactRelation}
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
      <FormDivider label="MLH Survey and Consent" />

      <div className="flex flex-col gap-2 pb-4">
        <label
          className="text-black dark:text-white"
          htmlFor="underrepresentedInput"
        >
          Do you identify as part of an underrepresented group in the technology
          industry?{" "}
          <span className="text-neutral-500 dark:text-neutral-400">
            (Optional)
          </span>
        </label>

        <Controller
          name="underrepresented"
          control={control}
          render={({ field: { onChange, value } }) => (
            <CustomSelect
              options={representation}
              isMulti={false}
              onChange={(val: SelectChoice | null) => onChange(val?.value)}
              value={representation.find((val) => val.value === value)}
            />
          )}
        />

        {errors.underrepresented && (
          <span className="text-error">{errors.underrepresented.message}</span>
        )}
      </div>
      <div className="flex flex-col gap-2 pb-4">
        <label className="text-black dark:text-white" htmlFor="genderInput">
          What&apos;s your gender?{" "}
          <span className="text-neutral-500 dark:text-neutral-400">
            (Optional)
          </span>
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
          Do you consider yourself to be any of the following?{" "}
          <span className="text-neutral-500 dark:text-neutral-400">
            (Optional)
          </span>
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
          Which ethnic background do you identify with?{" "}
          <span className="text-neutral-500 dark:text-neutral-400">
            (Optional)
          </span>
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
      <p className="opacity-50 py-8">
        We are currently in the process of partnering with MLH. The following 3
        checkboxes are for this partnership. If we do not end up partnering with
        MLH, your information will not be shared
      </p>
      <FormCheckbox
        label="I have read and agree to the MLH Code of Conduct. (https://github.com/MLH/mlh-policies/blob/main/code-of-conduct.md)"
        id="agreeToMLHCodeOfConduct"
        errors={errors.agreeToMLHCodeOfConduct}
        register={register}
        link="https://static.mlh.io/docs/mlh-code-of-conduct.pdf"
      />
      <FormCheckbox
        label="I authorize you to share my application/registration information with Major League Hacking for event administration, ranking, and MLH administration in-line with the MLH Privacy Policy (https://github.com/MLH/mlh-policies/blob/main/privacy-policy.md). I further agree to the terms of both the MLH Contest Terms and Conditions (https://github.com/MLH/mlh-policies/blob/main/contest-terms.md) and the MLH Privacy Policy (https://github.com/MLH/mlh-policies/blob/main/privacy-policy.md)"
        id="agreeToMLHPrivacyPolicy"
        errors={errors.agreeToMLHPrivacyPolicy}
        register={register}
        link="https://mlh.io/privacy"
      />
      <FormCheckbox
        label="I authorize MLH to send me occasional emails about relevant events, career opportunities, and community announcements."
        id="agreeToMLHCommunications"
        errors={errors.agreeToMLHCommunications}
        register={register}
        optional
      />
      <button
        type="submit"
        className="mt-4 mb-4 btn btn-primary dark:text-white"
      >
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
            <h1 className="py-8 text-3xl font-bold text-center text-black dark:text-white md:text-left">
              Apply to DeltaHacks XI
            </h1>

            {!killed &&
              (autofillData.isPending ? (
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
  context: GetServerSidePropsContext,
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
