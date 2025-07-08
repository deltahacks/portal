import type { GetServerSidePropsContext, NextPage } from "next";
import React, { useState } from "react";
import Scheduler, { Editing, Resource } from "devextreme-react/scheduler";
import Drawer from "../components/Drawer";
import CustomStore from "devextreme/data/custom_store";

import "devextreme/dist/css/dx.dark.css";

const toMilitaryTime = (date: Date) => {
  // Get hours and minutes
  const hours = date.getHours();
  const minutes = date.getMinutes();

  // Pad single-digit hours and minutes with leading zeros
  const militaryHours = hours < 10 ? "0" + hours : hours.toString();
  const militaryMinutes = minutes < 10 ? "0" + minutes : minutes.toString();

  // Concatenate hours and minutes in military time format
  const militaryTime = militaryHours + ":" + militaryMinutes;

  return militaryTime;
};

const eventColours = [
  { id: 0, color: "rgba(250, 250, 250, 88%)" },
  { id: 1, color: "#50d2de" },
  { id: 2, color: "#fed750" },
  { id: 3, color: "#eb5e7a" },
  { id: 4, color: "#aa7ef7" },
  { id: 5, color: "#7ee683" },
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
    "c_54f72353fe8b6d9a474ba47ea768e372311c2365c69030509cd80b650ffb883b@group.calendar.google.com";
  const PUBLIC_KEY = "AIzaSyBnNAISIUKe6xdhq1_rjor2rxoI3UlMY7k";

  const dataUrl = [
    GOOGLE_CALENDAR_URL,
    CALENDAR_ID,
    "/events?key=",
    PUBLIC_KEY,
  ].join("");

  const response = await fetch(dataUrl, requestOptions);

  const { items: events } = await response.json();

  const colorMap = new Map<string, number>();

  colorMap.set("Event", 1);
  colorMap.set("Workshop", 2);
  colorMap.set("Important", 3);
  colorMap.set("Deadline", 4);
  colorMap.set("Food", 5);

  const updatedEvents = events.map((event: any) => {
    const eventType = event.summary.split("|").at(-1).trim();
    const eventColorId = colorMap.get(eventType) ?? 0;

    return {
      ...event,
      colorId: eventColorId,
    };
  });

  return updatedEvents;
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
  const curDate = new Date(2025, 0, 10);
  const defaultCurrentDate = curDate;
  const [view, setView] = useState(
    defaultCurrentView == "day" ? "Calendar View" : "List View",
  );

  const renderEvent = ({
    colorId,
    summary,
    start,
    end,
    location,
  }: {
    colorId: number;
    summary: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    location: string;
  }) => {
    const militaryStartDate = toMilitaryTime(new Date(start.dateTime));
    const militaryEndDate = toMilitaryTime(new Date(end.dateTime));
    const summarySubHeading = `${militaryStartDate} - ${militaryEndDate}, ${location}`;

    const colour = eventColours.find((val) => val.id == colorId)?.color;

    if (view == "List View") {
      return (
        <>
          <div className="dx-item-content dx-scheduler-appointment-content">
            <div className="dx-scheduler-agenda-appointment-left-layout">
              <div
                className={`dx-scheduler-agenda-appointment-marker`}
                style={{ backgroundColor: colour }}
              />
            </div>
            <div className="dx-scheduler-agenda-appointment-right-layout">
              <div className="dx-scheduler-appointment-title">{summary}</div>
              <div className="dx-scheduler-appointment-content-details">
                <div className="dx-scheduler-appointment-content-date">
                  {summarySubHeading}
                </div>
              </div>
            </div>
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className="dx-scheduler-appointment-title">{summary}&nbsp;</div>
          <div className="dx-scheduler-appointment-content-details">
            <div className="dx-scheduler-appointment-content-date">
              {summarySubHeading}
            </div>
          </div>
        </>
      );
    }
  };

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
      appointmentRender={(data) => renderEvent(data.targetedAppointmentData)}
      appointmentTooltipRender={(data) =>
        renderEvent(data.targetedAppointmentData)
      }
      onAppointmentFormOpening={(e) => {
        e.cancel = true;
      }}
      onCurrentViewChange={(newView) => setView(newView)}
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

// docs for the calendar component https://js.devexpress.com/React/Documentation/Guide/UI_Components/Scheduler/Getting_Started_with_Scheduler/
const Schedule: NextPage = () => {
  return (
    <Drawer
      pageTabs={[
        { pageName: "Dashboard", link: "/dashboard" },
        { pageName: "Schedule", link: "/schedule" },
      ]}
    >
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

export default Schedule;

// add netlify cache control
// https://docs.netlify.com/routing/headers/#syntax-for-the-headers-file
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  // For disabling this page temporarily
  // return { redirect: { destination: "/", permanent: false } };

  ctx.res.setHeader("Netlify-Vary", "cookie=next-auth.session-token");
  ctx.res.setHeader("Cache-Control", "public, max-age=7200");

  // just return the page but with cache headers
  return {
    props: {},
  };
}
