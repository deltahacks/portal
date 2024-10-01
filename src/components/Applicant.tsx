import { useState } from "react";
import { trpc } from "../utils/trpc";
import { ApplicationForReview } from "../server/router/reviewers";
import { Button } from "./Button";
import FormDivider from "./FormDivider";
import UpdateStatusDropdown from "./UpdateStatusDropdown";

interface FormInputProps {
  label: string;
  text?: string | null;
  id?: string;
  optional?: boolean;
  link?: string;
}

const FormInput: React.FC<
  FormInputProps & React.HTMLProps<HTMLInputElement>
> = ({ label, text, optional }) => {
  return (
    <div className="flex flex-1 flex-col gap-2 pb-4">
      <label className="text-black dark:text-white">
        {label}{" "}
        {optional && (
          <span className="text-neutral-500 dark:text-neutral-400">
            (Optional)
          </span>
        )}
      </label>
      <div className="min-h-[3rem] p-3 border align-middle rounded-lg bg-white border-neutral-300 text-black placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500">
        {text}
      </div>
    </div>
  );
};

const FormCheckbox: React.FC<
  FormInputProps & React.HTMLProps<HTMLInputElement>
> = ({ label, checked, optional, link }) => {
  return (
    <>
      <div className="flex w-full items-center justify-between gap-2 pb-4 pt-4 md:flex-row-reverse md:justify-end">
        <label className="text-black dark:text-white">
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
        <div
          className={`checkbox-primary checkbox checkbox-lg ${
            checked ? "checked-checkbox" : ""
          } rounded-sm bg-white p-4 dark:bg-neutral-800`}
        />
      </div>
    </>
  );
};

const FormTextArea: React.FC<
  FormInputProps & React.HTMLProps<HTMLTextAreaElement>
> = ({ label, text, optional }) => {
  const currentLength = text?.split(/\s/g).length ?? 0;
  return (
    <div className="flex flex-1 flex-col gap-2 pb-4">
      <label className="text-black dark:text-white">
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
      <div
        className="min-h-[10rem] p-3 border rounded-lg bg-white border-neutral-300 text-black placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
        placeholder="Type here..."
      >
        {text}
      </div>
    </div>
  );
};

const ApplicationContent = ({
  applicationForReview,
}: {
  applicationForReview: ApplicationForReview;
}) => {
  const { submitter } = applicationForReview;
  const { data } = trpc.reviewer.getApplication.useQuery({
    submitterId: submitter.id,
  });

  return (
    <>
      <FormDivider label="Personal Information" />
      <div className="flex w-full flex-col lg:flex-row lg:gap-4">
        <FormInput
          label={data?.get("first_name")?.question ?? ""}
          text={data?.get("first_name")?.answer}
          placeholder="John"
        />
        <FormInput
          label={data?.get("last_name")?.question ?? ""}
          text={data?.get("last_name")?.answer}
          placeholder="Doe"
        />
      </div>
      <FormInput
        id="birthday"
        label={data?.get("birthday")?.question ?? ""}
        text={data?.get("birthday")?.answer}
      />
      <FormInput
        label={data?.get("resume")?.question ?? ""}
        text={data?.get("resume")?.answer}
        placeholder="https://example.com/resume.pdf"
        optional
      />
      {submitter.email.endsWith("mcmaster.ca") && (
        <FormCheckbox
          label={data?.get("mac_experience_ventures")?.question ?? ""}
          checked={data?.get("mac_experience_ventures")?.answer === "true"}
          readOnly
        />
      )}
      <FormDivider label="Education" />
      <FormCheckbox
        label={data?.get("study_enrolled_post_secondary")?.question ?? ""}
        checked={data?.get("study_enrolled_post_secondary")?.answer === "true"}
        readOnly
      />
      {data?.get("study_enrolled_post_secondary")?.answer === "true" && (
        <div>
          <FormInput
            label={data?.get("study_location")?.question ?? ""}
            text={data?.get("study_location")?.answer}
            placeholder="School..."
            optional
          />
          <FormInput
            label={data?.get("study_degree")?.question ?? ""}
            text={data?.get("study_degree")?.answer}
            placeholder="Degree..."
            optional
          />
          <FormInput
            label={data?.get("study_major")?.question ?? ""}
            text={data?.get("study_major")?.answer}
            placeholder="Major..."
            optional
          />
          <FormInput
            label={data?.get("study_year")?.question ?? ""}
            text={data?.get("study_year")?.answer}
            placeholder="Study Year..."
            optional
          />
          <FormInput
            id="studyExpectedGraducation"
            label={data?.get("study_expected_grad")?.question ?? ""}
            text={data?.get("study_expected_grad")?.answer}
          />
        </div>
      )}
      optional
      <FormInput
        label={data?.get("prev_hackathons_count")?.question ?? ""}
        text={data?.get("prev_hackathons_count")?.answer}
      />
      <FormDivider label="Long Answer" />
      <FormTextArea
        id="longAnswerChange"
        label={data?.get("long_answer_1")?.question ?? ""}
        text={data?.get("long_answer_1")?.answer}
      />
      <FormTextArea
        id="longAnswerExperience"
        label={data?.get("long_answer_2")?.question ?? ""}
        text={data?.get("long_answer_2")?.answer}
      />
      <FormTextArea
        id="longAnswerTech"
        label={data?.get("long_answer_3")?.question ?? ""}
        text={data?.get("long_answer_3")?.answer}
      />
      <FormTextArea
        id="longAnswerMagic"
        label={data?.get("long_answer_4")?.question ?? ""}
        text={data?.get("long_answer_4")?.answer}
      />
      <FormDivider label="Survey" />
      <FormInput
        id="socialText"
        label={data?.get("social_links")?.question ?? ""}
        text={data?.get("social_links")?.answer}
        optional
      />
      <FormTextArea
        id="interests"
        label={data?.get("interests")?.question ?? ""}
        text={data?.get("interests")?.answer}
        optional
      />
      <FormInput
        id="tshirtSize"
        label={data?.get("tshirt_size")?.question ?? ""}
        text={data?.get("tshirt_size")?.answer}
      />
      <FormInput
        id="hackerKind"
        label={data?.get("hacker_skill")?.question ?? ""}
        text={data?.get("hacker_skill")?.answer}
      />
      <FormInput
        id="workshopChoices"
        label={data?.get("interested_workshops")?.question ?? ""}
        text={data?.get("interested_workshops")?.answer}
      />
      <FormInput
        id="discoverdFrom"
        label={data?.get("how_discovered")?.question ?? ""}
        text={data?.get("how_discovered")?.answer}
      />
      <FormInput
        id="gender"
        label={data?.get("gender")?.question ?? ""}
        text={data?.get("gender")?.answer}
      />
      <FormInput
        id="race"
        label={data?.get("race")?.question ?? ""}
        text={data?.get("race")?.answer}
      />
      <FormCheckbox
        id="alreadyHaveTeam"
        label={data?.get("already_have_team")?.question ?? ""}
        checked={data?.get("already_have_team")?.answer === "true"}
        readOnly
      />
      <FormCheckbox
        id="considerCoffee"
        label={data?.get("consider_coffee")?.question ?? ""}
        checked={data?.get("consider_coffee")?.answer === "true"}
        readOnly
      />
      <FormDivider label="Emergency Contact" />
      <div className="flex flex-col md:flex-row md:items-end md:gap-4">
        <FormInput
          id="emergencyContactName"
          label={data?.get("emergency_contact_name")?.question ?? ""}
          text={data?.get("emergency_contact_name")?.answer}
          placeholder="James Doe"
        />
        <FormInput
          id="emergencyContactRelation"
          label={data?.get("emergency_contact_relation")?.question ?? ""}
          text={data?.get("emergency_contact_relation")?.answer}
          placeholder="Parent / Guardian / Friend / Spouse"
        />
      </div>
      <FormInput
        id="emergencyContactPhone"
        label={data?.get("emergency_contact_phone")?.question ?? ""}
        text={data?.get("emergency_contact_phone")?.answer}
        placeholder="000-000-0000"
      />
      <FormDivider label="MLH Consent" />
      <FormCheckbox
        id="agreeToMLHCodeOfConduct"
        link="https://static.mlh.io/docs/mlh-code-of-conduct.pdf"
        label={data?.get("agree_to_mlh_code_of_conduct")?.question ?? ""}
        checked={data?.get("agree_to_mlh_code_of_conduct")?.answer === "true"}
        readOnly
      />
      <FormCheckbox
        id="agreeToMLHPrivacyPolicy"
        link="https://mlh.io/privacy"
        label={data?.get("agree_to_mlh_privacy_policy")?.question ?? ""}
        checked={data?.get("agree_to_mlh_privacy_policy")?.answer === "true"}
        readOnly
      />
      <FormCheckbox
        id="agreeToMLHCommunications"
        label={data?.get("agree_to_mlh_communications")?.question ?? ""}
        checked={data?.get("agree_to_mlh_communications")?.answer === "true"}
        optional
        readOnly
      />
    </>
  );
};

const ApplicationPopupButton = ({
  applicationForReview,
}: {
  applicationForReview: ApplicationForReview;
}) => {
  const [isVisible, setVisibility] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setVisibility(true)}>
        View
      </Button>
      {isVisible && (
        <>
          <div
            className="fixed z-0 top-0 left-0 w-screen h-screen bg-black/50"
            onClick={() => setVisibility(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full md:w-4/5 h-full md:h-5/6 rounded-md border dark:border-zinc-700 bg-white dark:bg-[#171717]">
            <div className="relative flex flex-col w-full h-full">
              <Button
                variant="destructive"
                className="md:absolute top-8 right-8 bg-red-500"
                onClick={() => setVisibility(false)}
              >
                Close
              </Button>
              <div className="w-full flex-auto flex flex-col p-8 overflow-y-scroll">
                <ApplicationContent
                  applicationForReview={applicationForReview}
                />
              </div>
              <div className="w-full md:w-auto flex-inital flex justify-center p-4 md:p-0 rounded-md md:absolute bottom-8 right-8">
                <UpdateStatusDropdown
                  submitterId={applicationForReview.submitter.id}
                  className="h-14 w-40 bg-primary font-bold dark:bg-primary text-white hover:text-white dark:text-white hover:bg-primary/60 hover:dark:bg-primary/80"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ApplicationPopupButton;
