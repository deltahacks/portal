import { NextPage } from "next";
import * as React from "react";
import FullCalendar from "@fullcalendar/react"; // must go before plugins
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import Background from "../components/Background";
import NavBar from "../components/NavBar";

// docs for the calendar component https://ej2.syncfusion.com/react/documentation/api/schedule/

const Schedule: NextPage = () => {
  const events = [
    {
      title: "meeting 1",
      date: new Date(2023, 0, 10, 10, 0),
    },
    { title: "meeting 2", date: new Date(2023, 0, 10, 12, 30) },
  ];

  return (
    <div className="drawer-content">
      <Background />
      <NavBar />
      <div className="p-8">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridWeek"
          weekends={false}
          events={events}
        />
      </div>
    </div>
  );
};

export default Schedule;
