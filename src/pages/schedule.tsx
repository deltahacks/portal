import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import Scheduler, { Editing, Resource } from "devextreme-react/scheduler";
import { Drawer } from "../components/NavBar";
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

// Filter out the organizer events
// const test = [
//   {
//     text: "hi",
//     startDate: new Date(Date.now()),
//     endDate: new Date("2023-1-13 23:59"),
//     description: "hi",
//     disabled: true,
//     allDay: false,
//     colorId: 0,
//   },
// ];

const getRandomIntegerFromRange = (start: number, end: number): number => {
  return Math.floor(Math.random() * (end - start + 1) + start);
};

const getEventsSchedule = async (): Promise<Event[]> => {
  const icsSchedule = await parseIcsSchedule();
  const eventsSchedule = icsSchedule.map((v) => ({
    ...v,
    disabled: true,
    colorId: v.allDay
      ? 0
      : getRandomIntegerFromRange(0, eventColours.length - 1),
  }));
  return eventsSchedule;
};

// Remove resource label from scheduler
const removeResourceLabel = () => {
  setTimeout(() => {
    // Add an event listener to popup
    const popups = document.querySelectorAll(".dx-overlay-content");
    popups.forEach((popup) => {
      popup.addEventListener("click", removeResourceLabel);
    });
  }, 500);

  setTimeout(() => {
    const resource = document.querySelector("textarea");
    const parent8 =
      resource?.parentElement?.parentElement?.parentElement?.parentElement
        ?.parentElement?.parentElement?.parentElement?.parentElement;
    parent8?.removeChild(parent8?.lastElementChild as Node);
  }, 100);
};

const getDefaultCurrentDate = (start: Date, end: Date): Date => {
  const curDate = new Date(Date.now());
  return curDate < start || new Date("2023-1-15") < curDate
    ? new Date("2023-1-13")
    : curDate;
};

const MyScheduler = ({
  events,
  defaultCurrentView,
}: {
  events: Event[];
  defaultCurrentView: string;
}) => {
  const [eventStart, eventEnd] = [new Date("2023-1-13"), new Date("2023-1-15")];

  return (
    <Scheduler
      className="h-full"
      dataSource={events}
      views={["timelineDay", "agenda"]}
      defaultCurrentView={defaultCurrentView}
      defaultCurrentDate={getDefaultCurrentDate(eventStart, eventEnd)}
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

// docs for the calendar component https://ej2.syncfusion.com/react/documentation/api/schedule/
const Schedule: NextPage = () => {
  const [events, setEvents] = useState<Event[]>([]);

  const LoadingText = () => (
    <div className="py-4 text-4xl font-bold">Loading...</div>
  );

  const DesktopView = () => (
    <>
      {events.length === 0 && <LoadingText />}
      <MyScheduler events={events} defaultCurrentView="agenda" />
    </>
  );

  const MobileView = () => (
    <>
      {events.length === 0 && <LoadingText />}
      <MyScheduler events={events} defaultCurrentView="timelineDay" />
    </>
  );

  useEffect(() => {
    (async () => {
      const eventsSchedule = await getEventsSchedule();
      setEvents(eventsSchedule);
    })();
  }, []);

  return (
    <Drawer>
      <div className="flex-auto overflow-hidden" onClick={removeResourceLabel}>
        <div className="h-full pt-5 sm:hidden">
          <DesktopView />
        </div>
        <div className="hidden h-full p-8 sm:block">
          <MobileView />
        </div>
      </div>
    </Drawer>
  );
};

import dynamic from "next/dynamic";

export default dynamic(() => Promise.resolve(Schedule), {
  ssr: false,
});
