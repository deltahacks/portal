import clsx from "clsx";
import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { trpc } from "../utils/trpc";

interface ApplicantProps {
  response_id: string;
  firstName: string;
  lastName: string;
  birthday: Date;
  major: string;
  school: string;
  willBeEnrolled: boolean;
  graduationYear: Date;
  degree: string;
  currentLevel: string;
  hackathonCount: string;
  longAnswer1: string;
  longAnswer2: string;
  hackerId: string;
  longAnswer3: string;
  socialLinks: string;
  resume: string;
  reviews: IReview[];
  extra: string;
  tshirtSize: string;
  hackerType: string;
  hasTeam: boolean;
  workShop: string;
  gender: string;
  considerSponserChat: boolean;
  howDidYouHear: string;
  background: string;
  emergencyContactInfo: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
  };
  mlhAgreement: boolean;
  mlhCoc: boolean;
}

interface IReview {
  hacker: IUser;
  id: string;
  mark: number;
  reviewer: IUser;
}

interface IUser {
  email: string;
  emailVerified: string;
  id: string;
  image: string;
  name: string;
  role: string[];
  typeform_response_id: string;
}

const Applicant = ({ applicant }: { applicant: ApplicantProps }) => {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const submitGrade = trpc.useMutation("reviewer.submit");

  const session = useSession();

  const openInNewTab = (url: string) => {
    window.open(url, "_blank", "noopener");
  };

  const getScore = (reviewers: IReview[]) => {
    let average = 0;
    for (const review of reviewers) {
      average += review.mark;
    }
    return average / reviewers.length;
  };

  const [alreadyReviewed, setAlreadyReviewed] = useState<boolean>(false);

  useEffect(() => {
    setAlreadyReviewed(
      applicant.reviews.reduce((a, b) => {
        console.log("a", a, "b", b, "myid", session.data?.user?.id);
        return a || b.reviewer.id == session.data?.user?.id;
      }, false)
    );
  }, [applicant.reviews, session.data?.user?.id]);

  return (
    <>
      <tr className="bg-black text-left" onClick={() => setIsOpen(!isOpen)}>
        <td className="border border-slate-800 p-3">{applicant.firstName}</td>
        <td className="border border-slate-800 p-3">{applicant.lastName}</td>
        <td className="border border-slate-800 p-3">
          {applicant.reviews.length} / 3
        </td>
        <td className="border border-slate-800 p-3">
          {getScore(applicant.reviews)}
        </td>
        <td
          className="border border-slate-800 p-3"
          onClick={(e) => e.stopPropagation()}
        >
          <form className="flex flex-row gap-2">
            <p></p>
            <input
              type="number"
              min="1"
              max="5"
              ref={inputRef}
              className={
                alreadyReviewed
                  ? "hidden"
                  : "block w-full appearance-none rounded border border-gray-200 bg-gray-200 py-3 px-4 leading-tight text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
              }
            />
            <div>
              {alreadyReviewed ? (
                <p>Submitted</p>
              ) : (
                <button
                  className={clsx(
                    "w-full rounded  py-2 px-4 text-white",
                    "bg-primary"
                  )}
                  onClick={async (e) => {
                    e.preventDefault();
                    try {
                      await submitGrade.mutateAsync({
                        mark: parseInt(inputRef?.current?.value || ""),
                        hackerId: applicant.hackerId,
                      });
                      setAlreadyReviewed(true);
                    } catch (err: any) {
                      // FIXME
                      console.log(err.message);
                    }

                    if (inputRef.current) {
                      inputRef.current.value = "";
                    }
                  }}
                >
                  Submit
                </button>
              )}
            </div>
          </form>
        </td>
      </tr>
      {isOpen && (
        <tr>
          <td colSpan={6} className="bg-[#1F1F1F] py-5 px-10">
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
                    <div className="mt-5 mb-3 font-bold">
                      If you had the ability to change anything in the world,
                      what would it be and why?
                    </div>
                    <div>{applicant.longAnswer1}</div>
                  </div>
                  <div>
                    <div className="mt-5 mb-3 font-bold">
                      What is a project you hope to undertake in the future? And
                      why not now?This question is required.
                    </div>
                    <div>{applicant.longAnswer2}</div>
                  </div>
                  <div>
                    <div className="mt-5 mb-3 font-bold">
                      If you could only speak in sentences from the script of
                      one movie, which movie would it be and why?This question
                      is required.
                    </div>
                    <div>{applicant.longAnswer3}</div>
                  </div>
                  <div>
                    <div className="mt-5 mb-3 font-bold">Extras</div>
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
                  className="w-8/12 rounded bg-primary py-2 px-4 text-white hover:bg-sky-900"
                  onClick={() => openInNewTab(applicant.resume)}
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
