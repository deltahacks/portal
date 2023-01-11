import { NextPage } from "next";
import * as React from "react";
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
    if (size === "small") {
      return (
        <FullCalendar
          height="100%t "
          plugins={[dayGridPlugin, timeGridPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
          }}
          initialView="timeGridDay"
          events={events}
        />
      );
    }
    return (
      <FullCalendar
        height="100%"
        plugins={[dayGridPlugin, timeGridPlugin]}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "timeGridWeek,timeGridDay",
        }}
        initialView="timeGridWeek"
        events={events}
      />
    );
  };

  return (
    <div className="drawer-content">
      <Background />
      <NavBar />
      <div className="p-8">
        <div className="hidden lg:block">
          <Calendar size="medium" />
        </div>
        <div className="lg:hidden">
          <Calendar size="small" />
        </div>
      </div>
    </div>
  );
};

export default Schedule;
