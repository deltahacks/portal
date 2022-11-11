import { useState } from "react";

const Applicant = ({ applicant }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openInNewTab = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <tr className="bg-black text-left">
        <td className="border border-slate-800 p-3">{applicant.firstName}</td>
        <td className="border border-slate-800 p-3">{applicant.lastName}</td>
        <td className="border border-slate-800 p-3">/3</td>
        <td className="border border-slate-800 p-3">-----</td>
        <td className="border border-slate-800 p-3">
          <form className="flex flex-row gap-2">
            <input
              type="number"
              min="1"
              max="5"
              className="block w-full appearance-none rounded border border-gray-200 bg-gray-200 py-3 px-4 leading-tight text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
            />
            <button className="rounded bg-sky-700 py-2 px-4 text-white hover:bg-sky-900">
              Submit
            </button>
          </form>
        </td>
        <td className="border border-slate-800 p-3">
          <button
            className="rounded bg-sky-700 py-2 px-4 text-white hover:bg-sky-900"
            onClick={() => setIsOpen(!isOpen)}
          >
            View
          </button>
        </td>
      </tr>
      {isOpen && (
        <tr>
          <td colSpan={"100%"} className="bg-[#1F1F1F] py-5 px-10">
            <div className="text-lg font-bold text-white">
              Application Overview
            </div>
            <div className="flex flex-row gap-3 py-3">
              <div className="flex w-7/12 flex-col gap-3">
                <div className="rounded border border-slate-300 p-6">
                  <div className="text-lg">Basic Information</div>
                  <hr className="mt-2 border-t border-slate-100"></hr>
                  <div className="mt-2">
                    <strong>Name: </strong> {applicant.firstName}{" "}
                    {applicant.lastName}
                  </div>
                  <div>
                    <strong>Birthday: </strong> {applicant.birthday}
                  </div>
                  <div>
                    <strong>Major: </strong> {applicant.major}
                  </div>
                  <div>
                    <strong>Enrolled: </strong> {applicant.willBeEnrolled}
                  </div>
                  <div>
                    <strong>Graduation Year: </strong>{" "}
                    {applicant.graduationYear}
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

                <div className="h-64 overflow-y-scroll rounded border border-slate-300 p-6">
                  <div className="text-lg">Long Answer Questions</div>
                  <hr className="mt-2 border-t border-slate-100"></hr>
                  <div>
                    <div className="mt-5 font-bold">Question 1 Answer</div>
                    <div>{applicant.longAnswer1}</div>
                  </div>
                  <div>
                    <div className="mt-5 font-bold">Question 2 Answer</div>
                    <div>{applicant.longAnswer2}</div>
                  </div>
                  <div>
                    <div className="mt-5 font-bold">Question 3 Answer</div>
                    <div>{applicant.longAnswer3}</div>
                  </div>
                  <div>
                    <div className="mt-5 font-bold">Extra</div>
                    <div>{applicant.extra}</div>
                  </div>
                </div>

                <div className="h-40 overflow-y-scroll rounded border border-slate-300 p-6">
                  <div className="text-lg">Additional Information</div>
                  <hr className="mt-2 border-t border-slate-100"></hr>
                  <div className="mt-5">
                    <strong>T-Shirt Size: </strong> {applicant.tshirtSize}
                  </div>
                  <div>
                    <strong>Hacker Type: </strong> {applicant.hackerType}
                  </div>
                  <div>
                    <strong>Has Team: </strong> {applicant.hasTeam}
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
                      {applicant.emergencyContactInfo.firstName}{" "}
                      {applicant.emergencyContactInfo.lastName}
                    </p>
                    <p>
                      &emsp;<b>Phone Number:</b>{" "}
                      {applicant.emergencyContactInfo.phoneNumber}
                    </p>
                    <p>
                      &emsp;<b>Email:</b> {applicant.emergencyContactInfo.email}
                    </p>
                  </div>
                  <div>
                    <strong>MLH Agreement: </strong> {applicant.mlhAgreement}
                  </div>
                  <div>
                    <strong>MLH Consent: </strong> {applicant.mlhCoc}
                  </div>
                </div>
              </div>
              <div className="flex w-5/12 flex-col items-center gap-3">
                <iframe
                  width="100%"
                  height="100%"
                  src={applicant.resume}
                ></iframe>
                <button
                  className="w-8/12 rounded bg-sky-700 py-2 px-4 text-white hover:bg-sky-900"
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
