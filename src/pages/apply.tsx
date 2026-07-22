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
import { useTheme } from "next-themes";
import FormInput from "../components/CustomInput";

export type InputsType = z.input<typeof applicationSchema>;
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
      <div className="flex items-center justify-between w-full gap-2 pt-4 md:flex-row-reverse md:justify-end">
        <div className="flex flex-col gap-1">
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
          <span className="text-error text-sm h-6 block pt-2">
            {errors?.message ?? ""}
          </span>
        </div>
        <input
          className="p-2 bg-white rounded-sm checkbox-primary checkbox checkbox-lg dark:bg-neutral-800"
          type="checkbox"
          id={id}
          {...register(id)}
          {...props}
        />
      </div>
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
            "pt-4 flex justify-between items-center " +
            (wordLength > 150
              ? "text-red-500"
              : "text-neutral-500 dark:text-neutral-400")
          }
        >
          {151 - wordLength - (currentLength > 0 ? 1 : 0)} words left
          {errors && (
            <span className="text-error text-sm">{errors.message}</span>
          )}
        </div>
      </label>
      <textarea
        className="text-black rounded-lg textarea textarea-bordered border-neutral-300 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
        id={id}
        placeholder="Type here..."
        {...register(id)}
        {...props}
      />
    </div>
  );
};

interface FormUploadProps {
  uploadUrl: string;
  objectId: string;
  setUploadValue: (value: string) => void;
  currentValue: string | null | undefined;
}

const FormUpload: React.FC<FormUploadProps> = ({
  uploadUrl,
  objectId,
  setUploadValue,
  currentValue,
}) => {
  const { resolvedTheme } = useTheme();
  const [showUpload, setShowUpload] = useState(!currentValue);

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
        setShowUpload(false);
      },
      getResponseData: () => {
        return { url: objectId };
      },
    }),
  );

  const handleReplace = () => {
    uppy.cancelAll();
    setUploadValue("");
    setShowUpload(true);
  };

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
      {currentValue && !showUpload ? (
        <div className="flex flex-col gap-2 p-4 border rounded-lg border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-green-600 dark:text-green-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-black dark:text-white">
              Resume uploaded successfully
            </span>
          </div>
          <button
            type="button"
            onClick={handleReplace}
            className="mt-2 btn btn-sm btn-outline dark:text-white"
          >
            Replace file
          </button>
        </div>
      ) : (
        <Dashboard
          uppy={uppy}
          height={200}
          theme={resolvedTheme === "dark" ? "dark" : "light"}
        />
      )}
    </div>
  );
};

const ApplyForm = ({
  autofillData,
  persistId,
  userId,
}: {
  autofillData: ApplyFormAutofill;
  persistId: string;
  userId: string;
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
  } = trpc.application.submitDh13.useMutation({
    onSuccess: async () => {
      await router.push("/dashboard");
    },
  });

  useFormPersist(`dh13-applyForm:${persistId}`, {
    watch,
    setValue,
    storage: localStorage,
  });

  const [uploadUrl, setUploadUrl] = useState<string | null>(null);

  // "Different identity" lets applicants type their own orientation, which is stored directly in the `orientation` string
  // Start in write-in mode if the persisted value isn't one of the preset options
  const [selfDescribeOrientation, setSelfDescribeOrientation] = useState(
    () =>
      !!autofillData.orientation &&
      !orientations.some((o) => o.value === autofillData.orientation),
  );

  const { mutate, data } = trpc.file.getUploadUrl.useMutation({
    onSuccess: (data) => {
      setUploadUrl(data?.url);
    },
  });

  const objectId = `${userId}-dh13.pdf`;
  useEffect(() => {
    mutate({
      filename: objectId,
      contentType: "application/pdf",
    });
  }, []);

  const onSubmit: SubmitHandler<InputsType> = async (data) => {
    const processed = applicationSchema.parse(data);

    await submitAppAsync(processed);
  };

  console.error("Errors", errors);

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
      <div className="flex flex-col w-full   lg:flex-row lg:gap-4">
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
        <div className="flex justify-between items-center">
          <label className="text-black dark:text-white" htmlFor="countryInput">
            Country of Residence
          </label>
          {errors.country && (
            <span className="text-error text-sm">{errors.country.message}</span>
          )}
        </div>
        <Controller
          name="country"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
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
                defaultInputValue={autofillData.country ?? undefined}
              />
            );
          }}
        />
      </div>

      {/* Birthday Input */}
      <div className="flex flex-col gap-2 pb-4">
        <div className="flex justify-between items-center">
          <label className="text-black dark:text-white" htmlFor="birthdayInput">
            Birthday
          </label>
          {errors.birthday && (
            <span className="text-error text-sm">
              {errors.birthday.message?.includes("years")
                ? errors.birthday.message
                : "This field is required"}
            </span>
          )}
        </div>
        <input
          className="text-black rounded-lg input border-neutral-300 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
          type="date"
          id="birthdayInput"
          {...register("birthday", {})}
          placeholder="YYYY-MM-DD"
        />
      </div>
      {uploadUrl ? (
        <FormUpload
          uploadUrl={uploadUrl}
          objectId={objectId}
          setUploadValue={(v) => setValue("linkToResume", v)}
          currentValue={watch("linkToResume")}
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
            <div className="flex justify-between items-center">
              <label
                className="text-black dark:text-white"
                htmlFor="studyLocationInput"
              >
                Study Location
                <span className="text-neutral-500 dark:text-neutral-400">
                  {" "}
                  (Optional)
                </span>
              </label>
              {errors.studyLocation && (
                <span className="text-error text-sm">
                  {errors.studyLocation.message}
                </span>
              )}
            </div>

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
          </div>
          <div className="flex flex-col gap-2 pb-4">
            <div className="flex justify-between items-center">
              <label
                className="text-black dark:text-white"
                htmlFor="studyDegreeInput"
              >
                Study Degree
                <span className="text-neutral-500 dark:text-neutral-400">
                  {" "}
                  (Optional)
                </span>
              </label>
              {errors.studyDegree && (
                <span className="text-error text-sm">
                  {errors.studyDegree.message}
                </span>
              )}
            </div>
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
          </div>
          <div className="flex flex-col gap-2 pb-4">
            <div className="flex justify-between items-center">
              <label
                className="text-black dark:text-white"
                htmlFor="studyMajorInput"
              >
                Study Major
                <span className="text-neutral-500 dark:text-neutral-400">
                  {" "}
                  (Optional)
                </span>
              </label>
              {errors.studyMajor && (
                <span className="text-error text-sm">
                  {errors.studyMajor.message}
                </span>
              )}
            </div>
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
          </div>
          <div className="flex flex-col gap-2 pb-4">
            <div className="flex justify-between items-center">
              <label
                className="text-black dark:text-white"
                htmlFor="studyYearOfStudyInput"
              >
                Year of Study
                <span className="text-neutral-500 dark:text-neutral-400">
                  {" "}
                  (Optional)
                </span>
              </label>
              {errors.studyYearOfStudy && (
                <span className="text-error text-sm">
                  {errors.studyYearOfStudy.message}
                </span>
              )}
            </div>
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
          </div>
          <div className="flex flex-col gap-2 pb-4">
            <div className="flex justify-between items-center">
              <label
                className="text-black dark:text-white"
                htmlFor="studyExpectedGraduationInput"
              >
                Expected Graduation
                <span className="text-neutral-500 dark:text-neutral-400">
                  {" "}
                  (Optional)
                </span>
              </label>
              {errors.studyExpectedGraduation && (
                <span className="text-error text-sm">
                  {errors.studyExpectedGraduation.message}
                </span>
              )}
            </div>
            <input
              className="text-black rounded-lg input border-neutral-300 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
              type="date"
              id="studyExpectedGraduationInput"
              {...register("studyExpectedGraduation")}
            />
          </div>
        </div>
      )}
      <div className="flex flex-col gap-2 pb-4">
        <div className="flex justify-between items-center">
          <label
            className="text-black dark:text-white"
            htmlFor="previousHackathonsCountInput"
          >
            Previous Hackathons Count{" "}
          </label>
          {errors.previousHackathonsCount && (
            <span className="text-error text-sm">
              {errors.previousHackathonsCount.message}
            </span>
          )}
        </div>
        <select
          className="text-black rounded-lg input border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          id="previousHackathonsCountInput"
          {...register("previousHackathonsCount")}
          onWheel={(e) => {
            e.preventDefault();
          }}
        >
          <option value="" disabled>
            Select...
          </option>
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6+">6+</option>
        </select>
      </div>
      <FormDivider label="Long Answer" />
      <FormTextArea
        id="longAnswerPerspective"
        label="What is one perspective you would bring to a team that others might not immediately expect?"
        errors={errors.longAnswerPerspective}
        register={register}
        value={watch("longAnswerPerspective")}
      />
      <FormTextArea
        id="longAnswerUnexpectedSkill"
        label="What is a skill you learned when building a project you never expected you would need?"
        errors={errors.longAnswerUnexpectedSkill}
        register={register}
        value={watch("longAnswerUnexpectedSkill")}
      />
      <FormTextArea
        id="longAnswerFutureSelf"
        label="If your future self walked into the room right now, what’s the first thing they would judge you for?"
        errors={errors.longAnswerFutureSelf}
        register={register}
        value={watch("longAnswerFutureSelf")}
      />
      <FormTextArea
        id="longAnswerDayWith"
        label="If you could spend a day with anyone in the world, alive or not, who would it be? What would you do together and why do they inspire you?"
        errors={errors.longAnswerDayWith}
        register={register}
        value={watch("longAnswerDayWith") ?? ""}
        optional
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
        <div className="flex justify-between items-center">
          <label
            className="text-black dark:text-white"
            htmlFor="tshirtSizeInput"
          >
            What size t-shirt do you wear?
          </label>
          {errors.tshirtSize && (
            <span className="text-error text-sm">
              {errors.tshirtSize.message}
            </span>
          )}
        </div>
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
      </div>
      <div className="flex flex-col gap-2 pb-4">
        <div className="flex justify-between items-center">
          <label
            className="text-black dark:text-white"
            htmlFor="hackerKindInput"
          >
            What kind of hacker are you?
          </label>
          {errors.hackerKind && (
            <span className="text-error text-sm text-right text-balance">
              {errors.hackerKind.message}
            </span>
          )}
        </div>
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
      </div>
      <div className="flex flex-col gap-2 pb-4">
        <div className="flex justify-between items-center">
          <label
            className="text-black dark:text-white"
            htmlFor="workshopChoicesInput"
          >
            What type of workshops would you like to see at DeltaHacks 13?
            <span className="text-neutral-500 dark:text-neutral-400">
              (Optional)
            </span>
          </label>
          {errors.workshopChoices && (
            <span className="text-error text-sm">
              {errors.workshopChoices.message}
            </span>
          )}
        </div>
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
      </div>
      <div className="flex flex-col gap-2 pb-4">
        <div className="flex justify-between items-center">
          <label
            className="text-black dark:text-white"
            htmlFor="discoverdFromInput"
          >
            How did you find out about DeltaHacks 13?
          </label>
          {errors.discoverdFrom && (
            <span className="text-error text-sm text-right text-balance">
              {errors.discoverdFrom.message}
            </span>
          )}
        </div>
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
      <FormInput
        label="Do you have any dietary restrictions?"
        id="dietaryRestrictions"
        errors={errors.dietaryRestrictions}
        placeholder="e.g. vegetarian, nut allergy, halal, none"
        register={register}
      />
      <FormDivider label="Emergency Contact" />
      <div className="flex flex-col md:flex-row md:items-end md:gap-4">
        <FormInput
          label="Please put the name of an emergency contact"
          id="emergencyContactName"
          errors={errors.emergencyContactName}
          placeholder="John Smith"
          register={register}
        />
        <FormInput
          label="What is your emergency contact&apos;s relation to you?"
          id="emergencyContactRelation"
          errors={errors.emergencyContactRelation}
          placeholder="Parent / Guardian / Friend / Spouse"
          register={register}
        />
      </div>
      <FormInput
        id="emergencyContactPhone"
        label="What is your emergency contact&apos;s phone number?"
        errors={errors.emergencyContactPhone}
        placeholder="000-000-0000"
        register={register}
      />
      <FormDivider label="MLH Survey and Consent" />

      <div className="flex flex-col gap-2 pb-4">
        <div className="flex justify-between items-center">
          <label
            className="text-black dark:text-white"
            htmlFor="underrepresentedInput"
          >
            Do you identify as part of an underrepresented group in the
            technology industry?{" "}
            <span className="text-neutral-500 dark:text-neutral-400">
              (Optional)
            </span>
          </label>
          {errors.underrepresented && (
            <span className="text-error text-sm">
              {errors.underrepresented.message}
            </span>
          )}
        </div>

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
      </div>
      <div className="flex flex-col gap-2 pb-4">
        <div className="flex justify-between items-center">
          <label className="text-black dark:text-white" htmlFor="genderInput">
            What&apos;s your gender?{" "}
            <span className="text-neutral-500 dark:text-neutral-400">
              (Optional)
            </span>
          </label>
          {errors.gender && (
            <span className="text-error text-sm">{errors.gender.message}</span>
          )}
        </div>

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
      </div>
      <div className="flex flex-col gap-2 pb-4">
        <div className="flex justify-between items-center">
          <label
            className="text-black dark:text-white"
            htmlFor="orientationInput"
          >
            Do you consider yourself to be any of the following?{" "}
            <span className="text-neutral-500 dark:text-neutral-400">
              (Optional)
            </span>
          </label>
          {errors.orientation && (
            <span className="text-error text-sm">
              {errors.orientation.message}
            </span>
          )}
        </div>

        <Controller
          name="orientation"
          control={control}
          render={({ field: { onChange, value } }) => (
            <>
              <CustomSelect
                options={orientations}
                isMulti={false}
                onChange={(val: SelectChoice | null) => {
                  if (val?.value === "Different identity") {
                    setSelfDescribeOrientation(true);
                    onChange("");
                  } else {
                    setSelfDescribeOrientation(false);
                    onChange(val?.value);
                  }
                }}
                value={
                  selfDescribeOrientation
                    ? orientations.find(
                        (val) => val.value === "Different identity",
                      )
                    : orientations.find((val) => val.value === value)
                }
              />
              {selfDescribeOrientation && (
                <input
                  className="mt-2 text-black rounded-lg input border-neutral-300 placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
                  type="text"
                  placeholder="Please specify your identity"
                  value={value ?? ""}
                  onChange={(e) => onChange(e.target.value)}
                />
              )}
            </>
          )}
        />
      </div>
      <div className="flex flex-col gap-2 pb-4">
        <div className="flex justify-between items-center">
          <label className="text-black dark:text-white" htmlFor="raceInput">
            Which ethnic background do you identify with?{" "}
            <span className="text-neutral-500 dark:text-neutral-400">
              (Optional)
            </span>
          </label>
          {errors.race && (
            <span className="text-error text-sm">{errors.race.message}</span>
          )}
        </div>

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
        label="I authorize you to share my application/registration information with Major League Hacking for event administration, ranking, and administration (including the creation of linked accounts on MLH and DEV (https://dev.to)) in line with the MLH Privacy Policy. I further agree to the terms of both the MLH Contest Terms and Conditions (https://github.com/MLH/mlh-policies/blob/main/contest-terms.md) and the MLH Privacy Policy (https://github.com/MLH/mlh-policies/blob/main/privacy-policy.md)"
        id="agreeToMLHPrivacyPolicy"
        errors={errors.agreeToMLHPrivacyPolicy}
        register={register}
        link="https://mlh.io/privacy"
      />
      <FormCheckbox
        label="I authorize MLH + DEV to send me occasional emails about relevant events, career opportunities, and community announcements."
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
> = ({ email, killed, userId }) => {
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
        <title>Welcome - DeltaHacks 13</title>
      </Head>
      <Drawer>
        <div className="w-full">
          <div className="max-w-4xl p-4 mx-auto text-black dark:text-white md:w-1/2 md:p-0">
            <h1 className="py-8 text-3xl font-bold text-center text-black dark:text-white md:text-left">
              Apply to Deltahacks 13
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
                  userId={userId}
                />
              ))}

            {killed && (
              <div className="flex flex-col items-center justify-center h-full py-4 text-center">
                <div className="text-2xl text-center text-black bg-red-600 alert dark:text-white md:text-left">
                  <span>
                    Applications are now closed. For any questions, please
                    contact us at{" "}
                    <span className="font-bold">hello@deltahacks.com</span>
                  </span>
                  {/* <span> */}
                  {/* Applications are closed for Deltahacks 13. If you did not */}
                  {/* get to apply, we hope to see you next year! */}
                  {/* </span> */}
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
    include: { DH13Application: true },
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
  if (userEntry && userEntry.DH13Application !== null) {
    return { redirect: { destination: "/dashboard", permanent: false } };
  }

  return {
    props: {
      email: session.user.email,
      killed: killed,
      userId: session.user.id,
    },
  };
};

export default Apply;
