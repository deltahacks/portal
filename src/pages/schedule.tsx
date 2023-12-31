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

  console.log(data);

  return data.items;
};

const dataSource = new CustomStore({
  load: (options) => getData(options, { showDeleted: false }),
});

const ScheduleComponent = ({
  defaultCurrentView,
}: {
  defaultCurrentView: string;
}) => {
  // If the user is out of range of the event default them to the start date
  const curDate = new Date(
    2024, // year
    1, // month
    12 // day
  );
  const defaultCurrentDate = curDate;

  console.log(dataSource); // this datasource has nothihng...?

  // const [calData, setCalData] = useState([]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const data = await getData(null, { showDeleted: false });
  //     setCalData(data);
  //   };

  //   fetchData();
  // }, []);

  // console.log("CAL DATA", calData);

  // const calDataFormatted = calData.map((e) => ({
  //   text: e.summary,
  //   startDate: new Date(e.start.dateTime),
  //   endDate: new Date(e.end.dateTime),
  // }));

  // console.log("CAL DATA", calDataFormatted);
  return (
    <Scheduler
      className="h-full"
      dataSource={dataSource}
      views={[
        {
          type: "day",
          name: "DeltaHacks",
          intervalCount: 3,
        },
      ]}
      defaultCurrentView="day"
      cellDuration={60}
      firstDayOfWeek={0}
      editing={false}
      startDateExpr="start.dateTime"
      endDateExpr="end.dateTime"
      textExpr="summary"
    >
      <Editing allowAdding={false} />
      <Resource
        dataSource={eventColours}
        fieldExpr="colorId" // so its coloring based on the colorId of the event
        useColorAsDefault={true}
      />
    </Scheduler>
  );
};

// docs for the calendar component https://ej2.syncfusion.com/react/documentation/api/schedule/
const Schedule: NextPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [data, setData] = useState([]); // waht about this?

  return (
    <Drawer>
      <div className="flex-auto overflow-hidden">
        {/* desktop view */}
        <div className="h-full pt-5 sm:hidden">
          <ScheduleComponent defaultCurrentView="agenda" />
        </div>
        {/* mobile view */}
        <div className="hidden h-full p-8 sm:block">
          <ScheduleComponent defaultCurrentView="timelineDay" />
        </div>
      </div>
    </Drawer>
  );
};

import dynamic from "next/dynamic";

export default dynamic(() => Promise.resolve(Schedule), {
  ssr: false,
});
