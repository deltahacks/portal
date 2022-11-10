import { useState } from "react";

const Applicant = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  const openInNewTab = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <tr className="bg-black text-left">
        <td className="border border-slate-800 p-3">{props.firstName}</td>
        <td className="border border-slate-800 p-3">{props.lastName}</td>
        <td className="border border-slate-800 p-3">---------</td>
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

            <div className="flex flex-row mt-8 justify-between">
              <div className="flex flex-col">
                <div className="my-1.5">
                  <img className="inline-block h-5 w-5 mr-2.5" src="./images/person.svg"></img>
                  <span className="text-base text-white"><strong>John Doe</strong> (second year student)</span>
                </div>

                <div className="my-1.5">
                  <img  className="inline-block h-5 w-5 mr-2.5" src="./images/calendar.svg"></img>
                  <span className="text-base text-white">Instantiated 2000-01-01</span>
                </div>

                <div className="my-1.5">
                  <img className="inline-block h-5 w-5 mr-2.5" src="./images/school.svg"></img>
                  <span className="text-base text-white">Studied at McMaster University</span>
                </div>

                <div className="my-1.5">
                  <img className="inline-block h-5 w-5 mr-2.5" src="./images/laptop.svg"></img>
                  <span className="text-base text-white">Expert at Software Engineering (2021 - 2024)</span>
                </div>
              </div>

              <div className="flex flex-col ">
                <button 
                  className="text-base text-white bg-[#4F14EE] px-7 py-2.5 my-2.5 rounded-lg w-auto"
                  onClick={() => openInNewTab('https://youtu.be/dQw4w9WgXcQ')}
                >
                  Open Portfolio
                </button>

                <button 
                  className="text-base text-white px-7 py-2.5 my-2.5 rounded-lg border-[#0077B5] border-2 w-auto"
                  onClick={() => openInNewTab('https://youtu.be/dQw4w9WgXcQ')}
                >
                  Linkedin
                </button>
              </div>
            </div>

            <div className="text-base text-white text-center my-8 font-bold">
                ~ Attended <span className="text-3xl">5</span> Hackathons ~
            </div>

            <div className="border-[#ffffff]/40 border-2 mb-10 p-6 rounded overflow-y-scroll h-64">
              <div>
                <div className="text-base text-white font-bold mb-6">
                  Long Question 1
                </div>

                <div className="text-base text-white">
                  Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ea ut libero eaque culpa soluta alias.
                </div>
              </div>
            </div>

            <div className="w-auto h-10 border-[#ffffff]/40 border-2 my-10 border-dashed h-80">
              <iframe width="100%" height="100%" src="https://arxiv.org/pdf/1706.03762v5.pdf">
              </iframe>
            </div>

            <button 
              className="text-base text-white bg-[#4F14EE] px-7 py-2.5 my-2.5 rounded-lg w-auto rounded"
              onClick={() => openInNewTab('https://youtu.be/dQw4w9WgXcQ')}
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
