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
  const csvToArray = (csv: string) =>{
    const rows = csv.split("\n")
    return rows.map((row)=>{
      return row.split("\t")
    })
  } 
  const csvFilePath = "./Final_Deltahacks_Schedule_-_FINAL.tsv"
  fetch( csvFilePath )
    .then( response => response.text() )
    .then( response => {
        // -- parse csv
        const csv = csvToArray(response)
        console.log('data:', csv);
    });

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
        themeSystem="bootstrap"
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
    setTimeout(() => {
      const calendars = document.querySelectorAll(".fc-view-harness") ?? [
        { className: "" },
      ];
      for (let i = 0; i < calendars.length; ++i) {
        const calendar = calendars[i] ?? { className: "" };
        calendar.className = calendar.className + " bg-white";
      }

      const tables = document.querySelectorAll("table");
      for (let i = 0; i < tables.length; ++i) {
        const table = tables[i] ?? { style: { outline: "" } };
        table.style.outline = "1px solid black";
      }

      const title = document.querySelector("h2") ?? { className: "" };
      title.className = title.className + " text-white";
    }, 250);
  }, []);

  return (
    <div className="drawer-content absolute h-screen w-screen">
      <Background />
      <NavBar />
      <div className="py-5 px-9 lg:py-8 lg:px-10">
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