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
  const { dH10ApplicationId } = applicationForReview;
  const { data } = trpc.reviewer.getApplication.useQuery({ dH10ApplicationId });

  return (
    <>
      <FormDivider label="Personal Information" />
      <div className="flex w-full flex-col lg:flex-row lg:gap-4">
        <FormInput
          label="First Name"
          text={data?.lastName}
          placeholder="John"
        />
        <FormInput label="Last Name" text={data?.firstName} placeholder="Doe" />
      </div>
      <FormInput id="birthday" label="Birthday" text={data?.birthday} />
      <FormInput
        label="Link to Resume"
        text={data?.linkToResume}
        placeholder="https://example.com/resume.pdf"
        optional
      />
      {applicationForReview.email.endsWith("mcmaster.ca") && (
        <FormCheckbox
          label="Would you like to be a part of the McMaster Experience Ventures Program?"
          checked={data?.macEv}
          readOnly
        />
      )}
      <FormDivider label="Education" />
      <FormCheckbox
        label="Are you currently enrolled in post-secondary education?"
        checked={data?.studyEnrolledPostSecondary}
        readOnly
      />
      {data?.studyEnrolledPostSecondary && (
        <div>
          <FormInput
            label="Study Location"
            text={data?.studyLocation}
            placeholder="School..."
            optional
          />
          <FormInput
            label="Study Degree"
            text={data?.studyDegree}
            placeholder="Degree..."
            optional
          />
          <FormInput
            label="Study Major"
            text={data?.studyMajor}
            placeholder="Major..."
            optional
          />
          <FormInput
            label="Year of Study"
            text={data?.studyYearOfStudy}
            placeholder="Study Year..."
            optional
          />
          <FormInput
            id="studyExpectedGraducation"
            label="Expected Graduation"
            text={data?.studyExpectedGraduation}
          />
        </div>
      )}
      optional
      <FormInput
        label="Previous Hackathons Count"
        text={data?.previousHackathonsCount.toString()}
      />
      <FormDivider label="Long Answer" />
      <FormTextArea
        id="longAnswerChange"
        label="DeltaHacks is the annual Hackathon for Change. If you had the ability to change anything in the world, what would it be and why?"
        text={data?.longAnswerChange}
      />
      <FormTextArea
        id="longAnswerExperience"
        label="How do you hope to make the most out of your experience at DH10?"
        text={data?.longAnswerExperience}
      />
      <FormTextArea
        id="longAnswerTech"
        label="Which piece of future technology excites you most and where do you see it going?"
        text={data?.longAnswerTech}
      />
      <FormTextArea
        id="longAnswerMagic"
        label="You've been transported to an island with no clue of where you are. You are allowed 3 objects of your choice which will magically appear in front of you. How would you escape the island in time for DeltaHacks 10?"
        text={data?.longAnswerMagic}
      />
      <FormDivider label="Survey" />
      <FormInput
        id="socialText"
        label="What are your social media links?"
        text={data?.socialText ?? ""}
        optional
      />
      <FormTextArea
        id="interests"
        label="Is there anything else interesting you want us to know or see?"
        text={data?.interests ?? ""}
        optional
      />
      <FormInput id="tshirtSize" label="T-shirt Size" text={data?.tshirtSize} />
      <FormInput
        id="hackerKind"
        label="What kind of hacker are you?"
        text={data?.hackerKind}
      />
      <FormInput
        id="workshopChoices"
        label="What workshops are you interested in?"
        text={data?.workshopChoices.join(", ")}
      />
      <FormInput
        id="discoverdFrom"
        label="How did you hear about DeltaHacks?"
        text={data?.discoverdFrom.join(", ")}
      />
      <FormInput id="gender" label="Gender" text={data?.gender} />
      <FormInput id="race" label="Race" text={data?.race} />
      <FormCheckbox
        id="alreadyHaveTeam"
        label="Do you already have a team?"
        checked={data?.alreadyHaveTeam}
        readOnly
      />
      <FormCheckbox
        id="considerCoffee"
        label="Would you like to be considered for a coffee chat with a sponser?"
        checked={data?.considerCoffee}
        readOnly
      />
      <FormDivider label="Emergency Contact" />
      <div className="flex flex-col md:flex-row md:items-end md:gap-4">
        <FormInput
          id="emergencyContactName"
          label="Name of Emergency Contact"
          placeholder="James Doe"
          text={data?.emergencyContactName}
        />
        <FormInput
          id="emergencyContactRelation"
          label="Relation to Emergency Contact"
          placeholder="Parent / Guardian / Friend / Spouse"
          text={data?.emergencyContactRelation}
        />
      </div>
      <FormInput
        id="emergencyContactPhone"
        label="Emergency Contact Phone Number"
        placeholder="000-000-0000"
        text={data?.emergencyContactPhone}
      />
      <FormDivider label="MLH Consent" />
      <FormCheckbox
        id="agreeToMLHCodeOfConduct"
        label="Agree to MLH Code of Conduct"
        link="https://static.mlh.io/docs/mlh-code-of-conduct.pdf"
        checked={data?.agreeToMLHCodeOfConduct}
        readOnly
      />
      <FormCheckbox
        id="agreeToMLHPrivacyPolicy"
        label="Agree to MLH Privacy Policy"
        link="https://mlh.io/privacy"
        checked={data?.agreeToMLHPrivacyPolicy}
        readOnly
      />
      <FormCheckbox
        id="agreeToMLHCommunications"
        label="Agree to MLH Communications"
        checked={data?.agreeToMLHCommunications}
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
