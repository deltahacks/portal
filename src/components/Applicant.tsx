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
  const { data: application } = trpc.reviewer.getApplication.useQuery({
    submitterId: submitter.id,
  });

  return (
    <>
      <FormDivider label={application?.at(0)?.categoryName ?? ""} />
      <div className="flex w-full flex-col lg:flex-row lg:gap-4">
        <FormInput
          label={application?.at(0)?.questionAndAnswer.at(0)?.question ?? ""}
          text={application?.at(0)?.questionAndAnswer.at(0)?.answer}
          placeholder="John"
        />
        <FormInput
          label={application?.at(0)?.questionAndAnswer.at(1)?.question ?? ""}
          text={application?.at(0)?.questionAndAnswer.at(1)?.answer}
          placeholder="Doe"
        />
      </div>
      <FormInput
        id="birthday"
        label={application?.at(0)?.questionAndAnswer.at(2)?.question ?? ""}
        text={application?.at(0)?.questionAndAnswer.at(2)?.answer}
      />
      <FormInput
        label={application?.at(0)?.questionAndAnswer.at(3)?.question ?? ""}
        text={application?.at(0)?.questionAndAnswer.at(3)?.answer}
        placeholder="https://example.com/resume.pdf"
        optional
      />
      {submitter.email.endsWith("mcmaster.ca") && (
        <FormCheckbox
          label={application?.at(0)?.questionAndAnswer.at(5)?.question ?? ""}
          checked={
            application?.at(0)?.questionAndAnswer.at(5)?.answer === "true"
          }
          readOnly
        />
      )}
      <FormDivider label={application?.at(1)?.categoryName ?? ""} />
      <FormCheckbox
        label={application?.at(1)?.questionAndAnswer.at(0)?.question ?? ""}
        checked={application?.at(1)?.questionAndAnswer.at(0)?.answer === "true"}
        readOnly
      />
      {application?.at(1)?.questionAndAnswer.at(0)?.answer === "true" && (
        <div>
          <FormInput
            label={application?.at(1)?.questionAndAnswer.at(1)?.question ?? ""}
            text={application?.at(1)?.questionAndAnswer.at(1)?.answer}
            placeholder="School..."
            optional
          />
          <FormInput
            label={application?.at(1)?.questionAndAnswer.at(2)?.question ?? ""}
            text={application?.at(1)?.questionAndAnswer.at(2)?.answer}
            placeholder="Degree..."
            optional
          />
          <FormInput
            label={application?.at(1)?.questionAndAnswer.at(3)?.question ?? ""}
            text={application?.at(1)?.questionAndAnswer.at(3)?.answer}
            placeholder="Major..."
            optional
          />
          <FormInput
            label={application?.at(1)?.questionAndAnswer.at(4)?.question ?? ""}
            text={application?.at(1)?.questionAndAnswer.at(4)?.answer}
            placeholder="Study Year..."
            optional
          />
          <FormInput
            id="studyExpectedGraducation"
            label={application?.at(1)?.questionAndAnswer.at(5)?.question ?? ""}
            text={application?.at(1)?.questionAndAnswer.at(5)?.answer}
          />
        </div>
      )}
      optional
      <FormInput
        label={application?.at(1)?.questionAndAnswer.at(6)?.question ?? ""}
        text={application?.at(1)?.questionAndAnswer.at(6)?.answer}
      />
      <FormDivider label="Long Answer" />
      <FormTextArea
        id="longAnswerChange"
        label={application?.at(2)?.questionAndAnswer.at(0)?.question ?? ""}
        text={application?.at(2)?.questionAndAnswer.at(0)?.answer}
      />
      <FormTextArea
        id="longAnswerExperience"
        label={application?.at(2)?.questionAndAnswer.at(1)?.question ?? ""}
        text={application?.at(2)?.questionAndAnswer.at(1)?.answer}
      />
      <FormTextArea
        id="longAnswerTech"
        label={application?.at(2)?.questionAndAnswer.at(2)?.question ?? ""}
        text={application?.at(2)?.questionAndAnswer.at(2)?.answer}
      />
      <FormTextArea
        id="longAnswerMagic"
        label={application?.at(2)?.questionAndAnswer.at(3)?.question ?? ""}
        text={application?.at(2)?.questionAndAnswer.at(3)?.answer}
      />
      <FormDivider label="Survey" />
      <FormInput
        id="socialText"
        label={application?.at(3)?.questionAndAnswer.at(0)?.question ?? ""}
        text={application?.at(3)?.questionAndAnswer.at(0)?.answer}
        optional
      />
      <FormTextArea
        id="interests"
        label={application?.at(3)?.questionAndAnswer.at(1)?.question ?? ""}
        text={application?.at(3)?.questionAndAnswer.at(1)?.answer}
        optional
      />
      <FormInput
        id="tshirtSize"
        label={application?.at(3)?.questionAndAnswer.at(2)?.question ?? ""}
        text={application?.at(3)?.questionAndAnswer.at(2)?.answer}
      />
      <FormInput
        id="hackerKind"
        label={application?.at(3)?.questionAndAnswer.at(3)?.question ?? ""}
        text={application?.at(3)?.questionAndAnswer.at(3)?.answer}
      />
      <FormInput
        id="workshopChoices"
        label={application?.at(3)?.questionAndAnswer.at(4)?.question ?? ""}
        text={application?.at(3)?.questionAndAnswer.at(4)?.answer}
      />
      <FormInput
        id="discoverdFrom"
        label={application?.at(3)?.questionAndAnswer.at(5)?.question ?? ""}
        text={application?.at(3)?.questionAndAnswer.at(5)?.answer}
      />
      <FormInput
        id="gender"
        label={application?.at(3)?.questionAndAnswer.at(6)?.question ?? ""}
        text={application?.at(3)?.questionAndAnswer.at(6)?.answer}
      />
      <FormInput
        id="race"
        label={application?.at(3)?.questionAndAnswer.at(7)?.question ?? ""}
        text={application?.at(3)?.questionAndAnswer.at(7)?.answer}
      />
      <FormCheckbox
        id="alreadyHaveTeam"
        label={application?.at(3)?.questionAndAnswer.at(8)?.question ?? ""}
        checked={application?.at(3)?.questionAndAnswer.at(8)?.answer === "true"}
        readOnly
      />
      <FormCheckbox
        id="considerCoffee"
        label={application?.at(3)?.questionAndAnswer.at(9)?.question ?? ""}
        checked={application?.at(3)?.questionAndAnswer.at(9)?.answer === "true"}
        readOnly
      />
      <FormDivider label="Emergency Contact" />
      <div className="flex flex-col md:flex-row md:items-end md:gap-4">
        <FormInput
          id="emergencyContactName"
          label={application?.at(4)?.questionAndAnswer.at(0)?.question ?? ""}
          text={application?.at(4)?.questionAndAnswer.at(0)?.answer}
          placeholder="James Doe"
        />
        <FormInput
          id="emergencyContactRelation"
          label={application?.at(4)?.questionAndAnswer.at(1)?.question ?? ""}
          text={application?.at(4)?.questionAndAnswer.at(1)?.answer}
          placeholder="Parent / Guardian / Friend / Spouse"
        />
      </div>
      <FormInput
        id="emergencyContactPhone"
        label={application?.at(4)?.questionAndAnswer.at(2)?.question ?? ""}
        text={application?.at(4)?.questionAndAnswer.at(2)?.answer}
        placeholder="000-000-0000"
      />
      <FormDivider label="MLH Consent" />
      <FormCheckbox
        id="agreeToMLHCodeOfConduct"
        link="https://static.mlh.io/docs/mlh-code-of-conduct.pdf"
        label={application?.at(5)?.questionAndAnswer.at(0)?.question ?? ""}
        checked={application?.at(5)?.questionAndAnswer.at(0)?.answer === "true"}
        readOnly
      />
      <FormCheckbox
        id="agreeToMLHPrivacyPolicy"
        link="https://mlh.io/privacy"
        label={application?.at(5)?.questionAndAnswer.at(1)?.question ?? ""}
        checked={application?.at(5)?.questionAndAnswer.at(1)?.answer === "true"}
        readOnly
      />
      <FormCheckbox
        id="agreeToMLHCommunications"
        label={application?.at(5)?.questionAndAnswer.at(2)?.question ?? ""}
        checked={application?.at(5)?.questionAndAnswer.at(2)?.answer === "true"}
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
