import { useState } from "react";

const Applicant = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  const openInNewTab = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <tr className="bg-black text-left">
        <td className="border border-slate-800 p-3">{props.firstName}</td>
        <td className="border border-slate-800 p-3">{props.lastName}</td>
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
          <td colSpan={"100%"} className="bg-[#1F1F1F] py-10 px-20">
            <div className="text-lg font-bold text-white">
              Application Overview
            </div>

            <div className="mt-8 flex flex-row justify-between">
              <div className="flex flex-col">
                <div className="my-1.5">
                  <img
                    className="mr-2.5 inline-block h-5 w-5"
                    src="./images/person.svg"
                  ></img>
                  <span className="text-base text-white">
                    <strong>John Doe</strong> (second year student)
                  </span>
                </div>

                <div className="my-1.5">
                  <img
                    className="mr-2.5 inline-block h-5 w-5"
                    src="./images/calendar.svg"
                  ></img>
                  <span className="text-base text-white">
                    Instantiated 2000-01-01
                  </span>
                </div>

                <div className="my-1.5">
                  <img
                    className="mr-2.5 inline-block h-5 w-5"
                    src="./images/school.svg"
                  ></img>
                  <span className="text-base text-white">
                    Studied at McMaster University
                  </span>
                </div>

                <div className="my-1.5">
                  <img
                    className="mr-2.5 inline-block h-5 w-5"
                    src="./images/laptop.svg"
                  ></img>
                  <span className="text-base text-white">
                    Expert at Software Engineering (2021 - 2024)
                  </span>
                </div>
              </div>

              <div className="flex flex-col ">
                <button
                  className="my-2.5 w-auto rounded-lg bg-[#4F14EE] px-7 py-2.5 text-base text-white"
                  onClick={() => openInNewTab("https://youtu.be/dQw4w9WgXcQ")}
                >
                  Open Portfolio
                </button>

                <button
                  className="my-2.5 w-auto rounded-lg border-2 border-[#0077B5] px-7 py-2.5 text-base text-white"
                  onClick={() => openInNewTab("https://youtu.be/dQw4w9WgXcQ")}
                >
                  Linkedin
                </button>
              </div>
            </div>

            <div className="my-8 text-center text-base font-bold text-white">
              ~ Attended <span className="text-3xl">5</span> Hackathons ~
            </div>

            <div className="mb-10 h-64 overflow-y-scroll rounded border-2 border-[#ffffff]/40 p-6">
              <div>
                <div className="mb-6 text-base font-bold text-white">
                  Long Question 1
                </div>

                <div className="text-base text-white">
                  Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ea
                  ut libero eaque culpa soluta alias.
                </div>
              </div>
            </div>

            <div className="my-10 h-10 h-80 w-auto border-2 border-dashed border-[#ffffff]/40">
              <iframe
                width="100%"
                height="100%"
                src="https://arxiv.org/pdf/1706.03762v5.pdf"
              ></iframe>
            </div>

            <button
              className="my-2.5 w-auto rounded-lg rounded bg-[#4F14EE] px-7 py-2.5 text-base text-white"
              onClick={() => openInNewTab("https://youtu.be/dQw4w9WgXcQ")}
            >
              Open Resume
            </button>
          </td>
        </tr>
      )}
    </>
  );
};

export default Applicant;
