import { useState } from "react";

const Applicant = (props) => {
  const [isOpen, setIsOpen] = useState(false);
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
          <td colSpan={"100%"} className="bg-zinc-700">
            <div className="flex flex-row">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Laborum
              facilis reiciendis nulla. Reiciendis doloribus, nostrum iusto
              quis, qui beatae sequi voluptatibus omnis, voluptatum eligendi
              aliquid quae ad vero modi et.
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default Applicant;
