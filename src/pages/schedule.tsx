import { NextPage } from "next";
import React from "react";
import FullCalendar from "@fullcalendar/react"; // must go before plugins
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import Background from "../components/Background";
import NavBar from "../components/NavBar";

// docs for the calendar component https://ej2.syncfusion.com/react/documentation/api/schedule/

const Schedule: NextPage = () => {
  const events = [
    {
      title: "meeting 1",
      start: new Date(2023, 0, 10, 10, 0),
      end: new Date(2023, 0, 10, 12, 30),
    },
  ];

  const Calendar = ({ size }: { size: string }) => {
    const props =
      size === "small"
        ? {
            height: 48 + 20 * 5,
            initialView: "timeGridDay",
            right: "",
          }
        : {
            height: 64 + 32 * 3,
            initialView: "timeGridWeek",
            right: "timeGridWeek,timeGridDay",
          };

    return (
      <FullCalendar
        height={`calc(100vh - ${props.height}px)`}
        plugins={[dayGridPlugin, timeGridPlugin]}
        nowIndicator={true}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: props.right,
        }}
        initialView={props.initialView}
        events={events}
      />
    );
  };

  React.useEffect(() => {
    const fcDayToday = document.querySelector(".fc-day-today") ?? {
      style: { background: "" },
    };
    fcDayToday.style.background = "#F9FAFB !important";
    fcDayToday.style.border = "none !important";
  });

  return (
    <div className="drawer-content absolute h-screen w-screen">
      <Background />
      <NavBar />
      <div className="py-5 px-9 lg:py-8 lg:px-10">
        <div className="h-full lg:hidden">
          <Calendar size="small" />
        </div>
        <div className="hidden h-full lg:block">
          <Calendar size="large" />
        </div>
      </div>
    </div>
  );
};

export default Schedule;
