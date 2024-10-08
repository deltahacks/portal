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
      <FormDivider label={application?.at(0)?.formItem.statement ?? ""} />
      <div className="flex w-full flex-col lg:flex-row lg:gap-4">
        <FormInput
          label={application?.at(1)?.formItem.statement ?? ""}
          text={application?.at(1)?.answer}
          placeholder="John"
        />
        <FormInput
          label={application?.at(2)?.formItem.statement ?? ""}
          text={application?.at(2)?.answer}
          placeholder="Doe"
        />
      </div>
      <FormInput
        id="birthday"
        label={application?.at(3)?.formItem.statement ?? ""}
        text={application?.at(3)?.answer}
      />
      <FormInput
        label={application?.at(4)?.formItem.statement ?? ""}
        text={application?.at(4)?.answer}
        placeholder="https://example.com/resume.pdf"
        optional
      />
      {submitter.email.endsWith("mcmaster.ca") && (
        <FormCheckbox
          label={application?.at(5)?.formItem.statement ?? ""}
          checked={application?.at(5)?.answer === "true"}
          readOnly
        />
      )}
      <FormDivider label={application?.at(6)?.formItem?.statement ?? ""} />
      <FormCheckbox
        label={application?.at(7)?.formItem.statement ?? ""}
        checked={application?.at(7)?.answer === "true"}
        readOnly
      />
      {application?.at(7)?.answer === "true" && (
        <div>
          <FormInput
            label={application?.at(8)?.formItem.statement ?? ""}
            text={application?.at(8)?.answer}
            placeholder="School..."
            optional
          />
          <FormInput
            label={application?.at(9)?.formItem.statement ?? ""}
            text={application?.at(9)?.answer}
            placeholder="Degree..."
            optional
          />
          <FormInput
            label={application?.at(10)?.formItem.statement ?? ""}
            text={application?.at(10)?.answer}
            placeholder="Major..."
            optional
          />
          <FormInput
            label={application?.at(11)?.formItem.statement ?? ""}
            text={application?.at(11)?.answer}
            placeholder="Study Year..."
            optional
          />
          <FormInput
            id="studyExpectedGraducation"
            label={application?.at(12)?.formItem.statement ?? ""}
            text={application?.at(12)?.answer}
          />
        </div>
      )}
      optional
      <FormInput
        label={application?.at(13)?.formItem.statement ?? ""}
        text={application?.at(13)?.answer}
      />
      <FormDivider label={application?.at(14)?.formItem.statement ?? ""} />
      <FormTextArea
        id="longAnswerChange"
        label={application?.at(15)?.formItem.statement ?? ""}
        text={application?.at(15)?.answer}
      />
      <FormTextArea
        id="longAnswerExperience"
        label={application?.at(16)?.formItem.statement ?? ""}
        text={application?.at(16)?.answer}
      />
      <FormTextArea
        id="longAnswerTech"
        label={application?.at(17)?.formItem.statement ?? ""}
        text={application?.at(17)?.answer}
      />
      <FormTextArea
        id="longAnswerMagic"
        label={application?.at(18)?.formItem.statement ?? ""}
        text={application?.at(18)?.answer}
      />
      <FormDivider label={application?.at(19)?.formItem.statement ?? ""} />
      <FormInput
        id="socialText"
        label={application?.at(20)?.formItem.statement ?? ""}
        text={application?.at(20)?.answer}
        optional
      />
      <FormTextArea
        id="interests"
        label={application?.at(21)?.formItem.statement ?? ""}
        text={application?.at(21)?.answer}
        optional
      />
      <FormInput
        id="tshirtSize"
        label={application?.at(22)?.formItem.statement ?? ""}
        text={application?.at(22)?.answer}
      />
      <FormInput
        id="hackerKind"
        label={application?.at(23)?.formItem.statement ?? ""}
        text={application?.at(23)?.answer}
      />
      <FormInput
        id="workshopChoices"
        label={application?.at(24)?.formItem.statement ?? ""}
        text={application?.at(24)?.answer}
      />
      <FormInput
        id="discoverdFrom"
        label={application?.at(25)?.formItem.statement ?? ""}
        text={application?.at(25)?.answer}
      />
      <FormInput
        id="gender"
        label={application?.at(26)?.formItem.statement ?? ""}
        text={application?.at(26)?.answer}
      />
      <FormInput
        id="race"
        label={application?.at(27)?.formItem.statement ?? ""}
        text={application?.at(27)?.answer}
      />
      <FormCheckbox
        id="alreadyHaveTeam"
        label={application?.at(28)?.formItem.statement ?? ""}
        checked={application?.at(28)?.answer === "true"}
        readOnly
      />
      <FormCheckbox
        id="considerCoffee"
        label={application?.at(29)?.formItem.statement ?? ""}
        checked={application?.at(29)?.answer === "true"}
        readOnly
      />
      <FormDivider label={application?.at(30)?.formItem.statement ?? ""} />
      <div className="flex flex-col md:flex-row md:items-end md:gap-4">
        <FormInput
          id="emergencyContactName"
          label={application?.at(31)?.formItem.statement ?? ""}
          text={application?.at(31)?.answer}
          placeholder="James Doe"
        />
        <FormInput
          id="emergencyContactRelation"
          label={application?.at(32)?.formItem.statement ?? ""}
          text={application?.at(32)?.answer}
          placeholder="Parent / Guardian / Friend / Spouse"
        />
      </div>
      <FormInput
        id="emergencyContactPhone"
        label={application?.at(33)?.formItem.statement ?? ""}
        text={application?.at(33)?.answer}
        placeholder="000-000-0000"
      />
      <FormDivider label={application?.at(34)?.formItem.statement ?? ""} />
      <FormCheckbox
        id="agreeToMLHCodeOfConduct"
        link="https://static.mlh.io/docs/mlh-code-of-conduct.pdf"
        label={application?.at(35)?.formItem.statement ?? ""}
        checked={application?.at(35)?.answer === "true"}
        readOnly
      />
      <FormCheckbox
        id="agreeToMLHPrivacyPolicy"
        link="https://mlh.io/privacy"
        label={application?.at(36)?.formItem.statement ?? ""}
        checked={application?.at(36)?.answer === "true"}
        readOnly
      />
      <FormCheckbox
        id="agreeToMLHCommunications"
        label={application?.at(37)?.formItem.statement ?? ""}
        checked={application?.at(37)?.answer === "true"}
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
