import type { GetServerSidePropsContext, NextPage } from "next";
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

// https://calendar.google.com/calendar/ical/%40group.calendar.google.com/public/basic.ics

const getData = async (_: any, requestOptions: any) => {
  const GOOGLE_CALENDAR_URL =
    "https://www.googleapis.com/calendar/v3/calendars/";
  const CALENDAR_ID =
    "c_92d6993e1372148dd97f599a8cafdb44e2447818ee8f15b1faea783753e2e54c@group.calendar.google.com";
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

  const colorMap = new Map();

  colorMap.set("Event", 1);
  colorMap.set("Workshop", 2);
  colorMap.set("Important", 3);
  colorMap.set("Deadline", 4);
  colorMap.set("Food", 5);

  const updatedItems = data.items.map((item: any) => {
    const itemType = item.summary.split("|").at(-1).trim();
    const itemColorId = colorMap.get(itemType) ?? 0;

    return {
      ...item,
      colorId: itemColorId,
    };
  });
  console.log(updatedItems);

  return updatedItems;
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
    0, // month
    12 // day
  );
  const defaultCurrentDate = curDate;

  console.log(dataSource);

  return (
    <Scheduler
      className="h-full"
      dataSource={dataSource}
      views={[
        {
          type: "day",
          name: "Calendar View",
          intervalCount: 3,
        },
        {
          type: "agenda",
          name: "List View",
          intervalCount: 3,
        },
      ]}
      // defaultCurrentView="day"
      defaultCurrentView={defaultCurrentView}
      cellDuration={60}
      firstDayOfWeek={0}
      editing={false}
      startDateExpr="start.dateTime"
      endDateExpr="end.dateTime"
      textExpr="summary"
      currentDate={defaultCurrentDate}
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
        {/* mobile view */}
        <div className="h-full pt-5 sm:hidden">
          <ScheduleComponent defaultCurrentView="agenda" />
        </div>
        {/* desktop view */}
        <div className="hidden h-full p-8 sm:block">
          <ScheduleComponent defaultCurrentView="day" />
        </div>
      </div>
    </Drawer>
  );
};

// import dynamic from "next/dynamic";

// export default dynamic(() => Promise.resolve(Schedule), {
//   ssr: false,
// });

export default Schedule;

// add netlify cahce control
// https://docs.netlify.com/routing/headers/#syntax-for-the-headers-file

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  ctx.res.setHeader("Netlify-Vary", "cookie=next-auth.session-token");
  ctx.res.setHeader("Cache-Control", "public, max-age=7200");

  // just return the page but with cache headers
  return {
    props: {},
  };
}
