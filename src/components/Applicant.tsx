import { useState } from "react";
import { trpc } from "../utils/trpc";
import {
  ApplicationForReview,
  ApplicationSchemaWithStringDates,
} from "../server/router/reviewers";
import { Button } from "./Button";
import FormDivider from "./FormDivider";
import { useSession } from "next-auth/react";

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
          Word count: {currentLength}
        </div>
      </label>
      <div className="min-h-[10rem] p-3 border rounded-lg bg-white border-neutral-300 text-black placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500">
        {text}
      </div>
    </div>
  );
};

const ApplicationContent = ({
  applicationData: data,
}: {
  applicationData: ApplicationSchemaWithStringDates;
}) => {
  return (
    <>
      <FormDivider label="Personal Information" />
      <div className="flex w-full flex-col lg:flex-row lg:gap-4">
        <FormInput
          label="First Name"
          text={data?.firstName}
          placeholder="John"
        />
        <FormInput label="Last Name" text={data?.lastName} placeholder="Doe" />
      </div>
      <FormInput id="birthday" label="Birthday" text={data?.birthday} />
      <FormInput
        label="Link to Resume"
        text={data?.linkToResume}
        placeholder="https://example.com/resume.pdf"
        optional
      />
      {/* add phone number and country */}
      <FormInput
        label="Phone Number"
        text={data?.phone}
        placeholder="000-000-0000"
      />
      <FormInput label="Country" text={data?.country} placeholder="N/A" />

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
      <FormInput
        label="Previous Hackathons Count"
        text={data?.previousHackathonsCount.toString()}
      />
      <FormDivider label="Long Answer" />
      <FormTextArea
        id="longAnswerIncident"
        label="Describe an incident that reshaped your approach to teamwork, leadership, or maintaining a positive outlook"
        text={data?.longAnswerIncident}
      />
      <FormTextArea
        id="longAnswerGoals"
        label="How will you make the most out of your experience at DeltaHacks 11, and how will attending the event help you achieve your long-term goals?"
        text={data?.longAnswerGoals}
      />
      <FormTextArea
        id="longAnswerFood"
        label="What's your go-to comfort food?"
        text={data?.longAnswerFood}
      />
      <FormTextArea
        id="longAnswerTravel"
        label="If you could travel anywhere in the universe, where would you go and why?"
        text={data?.longAnswerTravel}
      />
      <FormTextArea
        id="longAnswerSocratica"
        label="If you did not have to worry about school/money/time, what is the one thing you would work on?"
        text={data?.longAnswerSocratica}
      />
      <FormDivider label="Survey" />
      {/* <FormInput
        id="socialText"
        label="What are your social media links?"
        text={data?.socialText.toString() ?? ""} // FIXME: Make it nicer for reviewers
        optional
      /> */}
      {data?.socialText.map((social, idx) => (
        <FormInput
          key={idx}
          id={`social ${idx}`}
          label={`Social Link ${idx + 1}`}
          text={social}
        />
      ))}
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
        text={data?.hackerKind.toString()}
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
      <FormCheckbox
        id="alreadyHaveTeam"
        label="Do you already have a team?"
        checked={data?.alreadyHaveTeam}
        readOnly
      />
      <FormCheckbox
        id="considerCoffee"
        label="Would you like to be considered for a coffee chat with a sponsor?"
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

const ReviewForm = ({
  applicationForReview,
}: {
  applicationForReview: ApplicationForReview;
}) => {
  const [score, setScore] = useState("");
  const [comments, setComments] = useState("");
  const [error, setError] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const submitScore = trpc.reviewer.submitScore.useMutation({
    onSettled() {
      utils.application.getStatusCount.invalidate();
      utils.reviewer.getApplication.invalidate();
    },
  });

  const handleSubmitReview = async () => {
    const scoreValue = Number(score);
    if (
      score === "" ||
      isNaN(scoreValue) ||
      scoreValue < 0 ||
      scoreValue > 17
    ) {
      setError("Please enter a valid score between 0 and 17");
      return;
    }

    try {
      await submitScore.mutateAsync({
        applicationId: applicationForReview.DH11ApplicationId,
        score: scoreValue,
        comment: comments,
      });
      setError(null);
    } catch (error) {
      console.error("Failed to submit review", error);
      setError("Failed to submit review. Please try again later.");
    }
  };

  return (
    <>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      <div>
        <label className="text-black dark:text-white font-bold">Score</label>
        <input
          type="number"
          min="0"
          max="17"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="w-full h-12 mt-2 p-3 border rounded-lg bg-white border-neutral-300 text-black placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          placeholder="Enter score (0-17)"
        />
      </div>
      <div>
        <label className="text-black dark:text-white font-bold">Comments</label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="w-full min-h-[10rem] mt-2 p-3 border rounded-lg bg-white border-neutral-300 text-black placeholder:text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white resize-none"
          placeholder="Enter comments..."
        />
      </div>
      <button
        onClick={handleSubmitReview}
        className={`rounded-lg px-7 py-2.5 text-sm font-bold whitespace-nowrap dark:bg-primary text-white hover:text-white dark:text-white hover:bg-primary/60 hover:dark:bg-primary/80 ${
          score === "" ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={score === ""}
      >
        Submit Review
      </button>
    </>
  );
};

const ReviewScores = ({ applicationId }: { applicationId: string }) => {
  const { data: reviewsData } = trpc.reviewer.getReviewsForApplication.useQuery(
    {
      applicationId: applicationId,
    },
  );

  return (
    <>
      <div className="text-black dark:text-white font-bold">
        <div>
          Average Score:{" "}
          {(reviewsData || []).reduce((acc, review) => acc + review.score, 0) /
            (reviewsData?.length || 1)}
          /17
        </div>
      </div>
      {reviewsData?.map((review, idx) => (
        <div key={idx} className="flex flex-col">
          <div className="">
            <b>{review.reviewer.name}</b>: {review.score}/17
          </div>
          <div>{review.comment}</div>
        </div>
      ))}
    </>
  );
};

const ApplicationPopupButton = ({
  applicationForReview,
}: {
  applicationForReview: ApplicationForReview;
}) => {
  const [isVisible, setVisibility] = useState(false);

  const { data: session } = useSession();
  const isAdmin = session?.user?.role?.includes?.("ADMIN") ?? false;

  const {
    data: applicationData,
    isPending: applicationIsLoading,
    error: applicationError,
  } = trpc.reviewer.getApplication.useQuery({
    dh11ApplicationId: applicationForReview.DH11ApplicationId,
  });

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
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full md:w-4/5 h-full md:h-5/6 rounded-md border dark:border-zinc-700 bg-white dark:bg-[#171717] flex">
            <Button
              variant="destructive"
              className="md:absolute top-4 right-4 bg-red-500"
              onClick={() => setVisibility(false)}
            >
              Close
            </Button>
            {applicationError ? (
              <div>{applicationError.message}</div>
            ) : applicationIsLoading ? (
              <div>Loading...</div>
            ) : (
              <>
                <div className="relative flex flex-col w-full h-full">
                  <div className="w-full flex-auto flex flex-col p-4 overflow-y-scroll">
                    {applicationData && (
                      <ApplicationContent applicationData={applicationData} />
                    )}
                  </div>
                </div>
                <div className="w-[1px] bg-zinc-700 my-4" />
                <div className="m-4 flex flex-col justify-end w-96 gap-4">
                  {applicationData?.hasReviewed || isAdmin ? (
                    <ReviewScores
                      applicationId={applicationForReview.DH11ApplicationId}
                    />
                  ) : (
                    <ReviewForm applicationForReview={applicationForReview} />
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default ApplicationPopupButton;
