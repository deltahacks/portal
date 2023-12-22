import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import Scheduler, { Editing, Resource } from "devextreme-react/scheduler";
import { Drawer } from "../components/NavBar";
import parseIcsSchedule from "../utils/parseIcsSchedule";
import { Event } from "../types/scheduler";
import CustomStore from "devextreme/data/custom_store";

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

const getData = async (_: any, requestOptions: any) => {
  const GOOGLE_CALENDAR_URL =
    "https://www.googleapis.com/calendar/v3/calendars/";
  const CALENDAR_ID =
    "25aa70904fce4f627895a2548224e21849fa24aed26334a8db8090ffbc8dc613@group.calendar.google.com";
  const PUBLIC_KEY = "AIzaSyBnNAISIUKe6xdhq1_rjor2rxoI3UlMY7k";

  const dataUrl = [
    GOOGLE_CALENDAR_URL,
    CALENDAR_ID,
    "/events?key=",
    PUBLIC_KEY,
  ].join("");
  console.log(dataUrl);

  const response = await fetch(dataUrl, requestOptions);

  const data = await response.json();

  return data.items;
};

// docs for the calendar component https://ej2.syncfusion.com/react/documentation/api/schedule/
const Schedule: NextPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [data, setData] = useState<any>(CustomStore);

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

  // Load in the tsv into the scheduler
  useEffect(() => {
    // (async () => {
    //   const data = [
    //     ...(await parseIcsSchedule()).map((v) => ({
    //       ...v,
    //       disabled: true,
    //       // Randomize the colour of the event. If allDay then make it white
    //       colorId: v.allDay
    //         ? 0
    //         : Math.floor(Math.random() * (eventColours.length - 1) + 1),
    //     })),
    //   ];
    //   console.log(data);
    //   setEvents(data);
    // })();
    // const dataSource = new CustomStore({
    //   load: (options) => getData(options, { showDeleted: false }),
    // });
    const dataSource = new CustomStore({
      load: (options) => getData(options, { showDeleted: false }),
    });
    setData(dataSource); // Replace `setData(dataSource);` with `setData([]);`
    console.log(data);
  }, []);

  const Schedule = ({ defaultCurrentView }: { defaultCurrentView: string }) => {
    // If the user is out of range of the event default them to the start date
    const curDate = new Date(Date.now());
    // const defaultCurrentDate =
    //   curDate < new Date("2023-1-13") || new Date("2023-1-15") < curDate
    //     ? new Date("2023-1-13")
    //     : curDate;
    const defaultCurrentDate = curDate;

    return (
      <Scheduler
        className="h-full"
        dataSource={data}
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
    <Drawer>
      <div className="flex-auto overflow-hidden" onClick={removeResourceLabel}>
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
    </Drawer>
  );
};

import dynamic from "next/dynamic";

export default dynamic(() => Promise.resolve(Schedule), {
  ssr: false,
});
