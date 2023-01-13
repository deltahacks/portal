import clsx from "clsx";
import { useState } from "react";

const DropdownItem = ({
  name,
  click,
}: {
  name: string;
  click: (nm: string) => void;
}) => {
  return (
    <li className="w-full" onClick={() => click(name)}>
      {name}
    </li>
  );
};

const EventsDropdown = () => {
  const events = [
    "REGISTRATION",
    "BREAKFAST",
    "FIRE DRILL TRAINING",
    "OPENING CEREMONY",
    "GROUP FORMATION",
    "GITHUB BASICS & ESSENTIALS",
    "RBC EMPLOYER EVENT - RESUME ROAST",
    "LUNCH",
    "GRAPH QL WORKSHOP W/ HYPERCARE",
    "FIRE NOODLE CHALLENGE",
    "SPONSOR SHOWCASE",
    "BOARD GAME LOUNGE OPENS",
    "ANDROID APP WITH AFZAL NAJAM",
    "JAX WORKSHOP",
    "MACHINE LEARNING WORKSHOP, CREATE AN APP FROM SCRATCH",
    "REACT WORKSHOP",
    "DINNER",
    "CUP STACKING",
    "SMASH EVENT",
    "BREAKFAST",
    "TALK WITH FUAD",
    "LUNCH",
    "CLOSING CEREMONY",
  ];

  const [selected, setSelected] = useState(events[0]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Choose an Event (you can scroll)</h1>
      <div
        tabIndex={0}
        className="max-h-60 overflow-y-scroll rounded-2xl bg-gray-400 p-4"
      >
        {events.map((event) => {
          return (
            <div
              key={event}
              onClick={() => setSelected(event)}
              className={clsx({
                "btn mb-4 flex w-full items-center justify-center": true,
                "btn-primary": selected !== event,
                "btn-success": selected === event,
              })}
            >
              {event}
            </div>
          );
        })}
      </div>
      Currently scanning for: {selected}
    </div>
  );
};

export default EventsDropdown;
