import clsx from "clsx";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { User } from "../../prisma/zod";
import { trpc } from "../utils/trpc";
import { TypeFormSubmission } from "../server/router/reviewers";

interface IReview {
  id: string;
  mark: number;
  hacker: User;
  reviewer: User;
}

const Applicant = ({
  applicant,
  index,
}: {
  index: number;
  applicant: TypeFormSubmission;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [grade, setGrade] = useState("");
  const submitGrade = trpc.reviewer.submit.useMutation();

  const session = useSession();

  const openInNewTab = (url: string) => {
    window.open(url, "_blank", "noopener");
  };

  const getScore = (reviewers: IReview[]) => {
    let average = 0;
    for (const review of reviewers) {
      average += review.mark;
    }
    if (reviewers.length != 0) {
      // round to 2 decimal places
      const s = average / reviewers.length;
      return s.toFixed(2);
    }
    return 0;
  };

  const preventMinus = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Minus") {
      e.preventDefault();
    }
  };

  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    setAlreadyReviewed(
      applicant.reviews.length > 2 ||
        applicant.reviews.some(
          (review) => review.reviewer.id === session.data?.user?.id
        )
    );
  }, [applicant.reviews, session.data?.user?.id]);

  return <>THIS PAGE IS UNDER CONSTRUCTION</>;

  return (
    <>
      <tr className="bg-black text-left" onClick={() => setIsOpen(!isOpen)}>
        <td className="border border-slate-800 p-3">{index}</td>
        <td className="border border-slate-800 p-3">{applicant.email}</td>
        <td className="border border-slate-800 p-3">{applicant.firstName}</td>
        <td className="border border-slate-800 p-3">{applicant.lastName}</td>
        <td className="border border-slate-800 p-3">
          {applicant.reviews.length} / 3
        </td>
        <td className="border border-slate-800 p-3">
          {/* {getScore(applicant.reviews)} */}
        </td>
        <td
          className="border border-slate-800 p-3"
          onClick={(e) => e.stopPropagation()}
        >
          <form className="flex flex-row gap-2">
            <input
              type="number"
              min="1"
              max="5"
              onKeyDown={preventMinus}
              onChange={(e) => setGrade(e.target.value)}
              value={grade}
              className={
                alreadyReviewed
                  ? "hidden"
                  : "block w-full appearance-none rounded border border-gray-200 bg-gray-200 px-4 py-3 leading-tight text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
              }
            />
            <div>
              {alreadyReviewed ? (
                <p>Reviewed</p>
              ) : (
                <button
                  className={clsx(
                    "w-full rounded  px-4 py-2 text-white",
                    "bg-primary"
                  )}
                  onClick={async (e) => {
                    e.preventDefault();
                    const gradeInt = parseInt(grade);
                    if (gradeInt <= 0 || 6 <= gradeInt) {
                      return;
                    }
                    await submitGrade.mutateAsync({
                      mark: gradeInt,
                      hackerId: applicant.hackerId,
                    });
                    setAlreadyReviewed(true);
                  }}
                >
                  Submit
                </button>
              )}
            </div>
          </form>
        </td>
        {/* <td className="border border-slate-800 p-4">
          <input
            onClick={(e) => e.stopPropagation()}
            type="checkbox"
            className="checkbox checkbox-primary"
          />
        </td> */}
      </tr>
      {isOpen && (
        <tr>
          <td colSpan={7} className="bg-[#1F1F1F] px-10 py-5">
            <div className="text-lg font-bold text-white">
              Application Overview
            </div>

            <div className="flex h-auto flex-row gap-3 py-3">
              <div className="flex w-7/12 flex-col gap-3">
                <div className="break-words rounded border border-slate-300 p-6">
                  <div className="text-lg">Basic Information</div>
                  <hr className="mt-2 border-t border-slate-100"></hr>
                  <div className="mt-2">
                    <strong>Name: </strong> {applicant.firstName}{" "}
                    {applicant.lastName}
                  </div>
                  <div>
                    <strong>Birthday: </strong>{" "}
                    {
                      new Date(applicant.birthday)
                        .toLocaleString()
                        .split(",")[0]
                    }
                  </div>
                  <div>
                    <strong>Major: </strong> {applicant.major}
                  </div>
                  <div>
                    <strong>Enrolled: </strong>{" "}
                    {applicant.willBeEnrolled ? "Yes" : "No"}
                  </div>
                  <div>
                    <strong>Graduation Year: </strong>{" "}
                    {
                      new Date(applicant.graduationYear)
                        .toLocaleString()
                        .split(",")[0]
                    }
                  </div>
                  <div>
                    <strong>Degree: </strong> {applicant.degree}
                  </div>
                  <div>
                    <strong>Current Level: </strong> {applicant.currentLevel}
                  </div>
                  <div>
                    <strong>Hackathon Count: </strong>{" "}
                    {applicant.hackathonCount}
                  </div>
                  <div>
                    <strong>Social Links: </strong> {applicant.socialLinks}
                  </div>
                </div>

                <div className="h-64 overflow-y-scroll break-words rounded border border-slate-300 p-6">
                  <div className="text-lg">Long Answer Questions</div>
                  <hr className="mt-2 border-t border-slate-100"></hr>
                  <div>
                    <div className="mb-3 mt-5 font-bold">
                      If you had the ability to change anything in the world,
                      what would it be and why?
                    </div>
                    <div>{applicant.longAnswer1}</div>
                  </div>
                  <div>
                    <div className="mb-3 mt-5 font-bold">
                      What is a project you hope to undertake in the future? And
                      why not now?This question is required.
                    </div>
                    <div>{applicant.longAnswer2}</div>
                  </div>
                  <div>
                    <div className="mb-3 mt-5 font-bold">
                      If you could only speak in sentences from the script of
                      one movie, which movie would it be and why?This question
                      is required.
                    </div>
                    <div>{applicant.longAnswer3}</div>
                  </div>
                  <div>
                    <div className="mb-3 mt-5 font-bold">Extras</div>
                    <div>{applicant.extra}</div>
                  </div>
                </div>

                <div className="h-40 overflow-y-scroll break-words rounded border border-slate-300 p-6">
                  <div className="text-lg">Additional Information</div>
                  <hr className="mt-2 border-t border-slate-100"></hr>
                  <div className="mt-5">
                    <strong>T-Shirt Size: </strong> {applicant.tshirtSize}
                  </div>
                  <div>
                    <strong>Hacker Type: </strong> {applicant.hackerType}
                  </div>
                  <div>
                    <strong>Has Team: </strong>{" "}
                    {applicant.hasTeam ? "Yes" : "No"}
                  </div>
                  <div>
                    <strong>Workshop: </strong> {applicant.workShop}
                  </div>
                  <div>
                    <strong>Gender: </strong> {applicant.gender}
                  </div>
                  <div>
                    <strong>Consider Sponser Chat: </strong>{" "}
                    {applicant.considerSponserChat}
                  </div>
                  <div>
                    <strong>How Did They hear: </strong>{" "}
                    {applicant.howDidYouHear}
                  </div>
                  <div>
                    <strong>Background: </strong> {applicant.background}
                  </div>
                  <div>
                    <strong>Emergency Contact Info: </strong>
                    <p>
                      &emsp;<b>Name:</b>{" "}
                      {applicant.emergencyContactInfo.firstName || "N/A"}
                      {applicant.emergencyContactInfo.lastName || "N/A"}
                    </p>
                    <p>
                      &emsp;<b>Phone Number:</b>{" "}
                      {applicant.emergencyContactInfo.phoneNumber || "N/A"}
                    </p>
                    <p>
                      &emsp;<b>Email:</b>{" "}
                      {applicant.emergencyContactInfo.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <strong>MLH Agreement: </strong>{" "}
                    {applicant.mlhAgreement ? "Yes" : "No"}
                  </div>
                  <div>
                    <strong>MLH Consent: </strong>{" "}
                    {applicant.mlhCoc ? "Yes" : "No"}
                  </div>
                </div>
              </div>
              <div className="flex w-5/12 flex-col items-center gap-3">
                {applicant.resume ? (
                  <iframe
                    width="100%"
                    height="100%"
                    loading="lazy"
                    src={applicant.resume || " "}
                  ></iframe>
                ) : (
                  "The applicant did not submit a resume"
                )}
                <button
                  className="w-8/12 rounded bg-primary px-4 py-2 text-white hover:bg-sky-900"
                  onClick={() => openInNewTab(applicant.resume ?? "")}
                >
                  Open Resume
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default Applicant;
