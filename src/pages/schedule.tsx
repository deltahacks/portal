import { NextPage } from "next";
import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react"; // must go before plugins
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import Background from "../components/Background";
import NavBar from "../components/NavBar";
import parseSchedule from "../utils/parseSchedule";

interface Event {
  title: string;
  start: Date;
  end: Date;
}

// docs for the calendar component https://ej2.syncfusion.com/react/documentation/api/schedule/
const Schedule: NextPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const csvToArray = (csv: string) => {
    const rows = csv.split("\n");
    return rows.map((row) => {
      return row.split("\t");
    });
  };

  const adjustStyles = () => {
    const adjustStyleOf = (
      element: string,
      className: string,
      outline = "",
      height = "",
      whiteSpace = ""
    ) => {
      const elements = document.querySelectorAll(element) ?? [];
      for (let i = 0; i < elements.length; ++i) {
        const el = (elements[i] as HTMLElement) ?? {
          className: "",
          style: { outline: "", height: "" },
        };
        if (element === ".fc-event-title") {
          console.log(el.className, className);
        }
        el.className += " " + className;
        el.style.outline = outline;
        el.style.height = height;
        el.style.whiteSpace = whiteSpace;
      }
    };

    setTimeout(() => {
      adjustStyleOf(".fc-view-harness", "bg-white");
      adjustStyleOf("table", "", "1px solid black");
      adjustStyleOf("h2", "text-white");
      adjustStyleOf(".fc-timegrid-slot", "", "", "7em");
      adjustStyleOf(".fc-event-title", "pr-20 md:pr-40");
      adjustStyleOf(".fc-event", "");
    }, 250);
  };

  // Change theme of calendar and load in the tsv
  React.useEffect(() => {
    const csvFilePath = "./Final_Deltahacks_Schedule_-_FINAL.tsv";
    fetch(csvFilePath)
      .then((response) => response.text())
      .then((response) => {
        // -- parse csv
        const csv = csvToArray(response);
        setEvents(parseSchedule(csv));
      });
    adjustStyles();
  }, []);

  const Calendar = ({ size }: { size: string }) => {
    const props =
      size === "small" ? { height: 48 + 20 * 5 } : { height: 64 + 32 * 3 };

    return (
      <FullCalendar
        height={`calc(100vh - ${props.height}px)`}
        themeSystem="bootstrap"
        plugins={[dayGridPlugin, timeGridPlugin]}
        nowIndicator={true}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "",
        }}
        initialView="timeGridDay"
        displayEventTime={false}
        events={events}
      />
    );
  };

  return (
    <div className="drawer-content absolute h-screen w-screen">
      <Background />
      <NavBar />
      <div className="py-5 px-9 lg:py-8 lg:px-10" onClick={adjustStyles}>
        <div className="h-full text-black lg:hidden">
          <Calendar size="small" />
        </div>
        <div className="hidden h-full text-black lg:block">
          <Calendar size="large" />
        </div>
      </div>
    </div>
  );
};

export default Schedule;
