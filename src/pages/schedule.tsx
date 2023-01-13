import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import Scheduler, { Editing, Resource } from "devextreme-react/scheduler";
import Background from "../components/Background";
import NavBar from "../components/NavBar";
import parseIcsSchedule from "../utils/parseIcsSchedule";
import { Event } from "../types/scheduler";

import "devextreme/dist/css/dx.dark.css";

const eventColours = [
  { id: 0, color: "rgba(250, 250, 250, 88%)" },
  { id: 1, color: "#50d2de" },
  { id: 2, color: "#fed750" },
  { id: 3, color: "#eb5e7a" },
  { id: 4, color: "#aa7ef7" },
  // { id: 5, color: "#7ee683" },
];

const test = [
  {
    text: "hi",
    startDate: new Date(Date.now()),
    endDate: new Date("2023-1-13 23:59"),
    description: "hi",
    disabled: true,
    allDay: false,
    colorId: 0,
  },
];

// docs for the calendar component https://ej2.syncfusion.com/react/documentation/api/schedule/
const Schedule: NextPage = () => {
  const [events, setEvents] = useState<Event[]>([]);

  // Load in the tsv into the scheduler
  useEffect(() => {
    (async () => {
      const data = [
        ...(await parseIcsSchedule()).map((v) => ({
          ...v,
          disabled: true,
          // Randomize the colour of the event
          colorId: Math.floor(Math.random() * (eventColours.length - 1) + 1),
        })),
      ];
      setEvents(data);
    })();
  }, []);

  const Schedule = ({ defaultCurrentView }: { defaultCurrentView: string }) => {
    // If the user is out of range of the event default them to the start date
    const curDate = new Date(Date.now());
    const defaultCurrentDate =
      curDate < new Date("2023-1-13") || new Date("2023-1-15") < curDate
        ? new Date("2023-1-13")
        : curDate;

    return (
      <Scheduler
        className="h-full"
        dataSource={events}
        views={["timelineDay", "agenda"]}
        defaultCurrentView={defaultCurrentView}
        defaultCurrentDate={defaultCurrentDate}
        cellDuration={60}
        firstDayOfWeek={0}
      >
        <Editing allowAdding={false} />
        <Resource
          dataSource={eventColours}
          fieldExpr="colorId"
          useColorAsDefault={true}
        />
      </Scheduler>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <Background />
      <div className="flex-initial">
        <NavBar />
      </div>
      <div className="flex-auto overflow-hidden">
        {/* desktop view */}
        <div className="h-full pt-5 sm:hidden">
          {events.length === 0 && (
            <div className="py-4 text-4xl font-bold">Loading...</div>
          )}
          <Schedule defaultCurrentView="agenda" />
        </div>
        {/* mobile view */}
        <div className="hidden h-full p-8 sm:block">
          {events.length === 0 && (
            <div className="py-4 text-4xl font-bold">Loading...</div>
          )}
          <Schedule defaultCurrentView="timelineDay" />
        </div>
      </div>
    </div>
  );
};

import dynamic from "next/dynamic";

export default dynamic(() => Promise.resolve(Schedule), {
  ssr: false,
});
