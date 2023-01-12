import { NextPage } from "next";
import React, { useState } from "react";
import Scheduler, { Editing, Resource } from "devextreme-react/scheduler";
import Background from "../components/Background";
import NavBar from "../components/NavBar";
import parseSchedule from "../utils/parseSchedule";

import "devextreme/dist/css/dx.dark.css";

interface Event {
  text: string;
  startDate: Date;
  endDate?: Date;
  disabled: boolean;
  allDay: boolean;
  colorId: number;
}

const eventColours = [
  { id: 0, color: "#50d2de" },
  { id: 1, color: "#fed750" },
  { id: 2, color: "#eb5e7a" },
  { id: 3, color: "#aa7ef7" },
];

// docs for the calendar component https://ej2.syncfusion.com/react/documentation/api/schedule/
const Schedule: NextPage = () => {
  const [events, setEvents] = useState<Event[]>([]);

  const csvToArray = (csv: string) => {
    const rows = csv.split("\n");
    return rows.map((row) => {
      return row.split("\t");
    });
  };

  // Change theme of calendar and load in the tsv
  React.useEffect(() => {
    const csvFilePath = "./Final_Deltahacks_Schedule_-_FINAL.tsv";
    fetch(csvFilePath)
      .then((response) => response.text())
      .then((response) => {
        // -- parse csv
        const csv = csvToArray(response);
        const data = parseSchedule(csv).map((v) => ({
          ...v,
          disabled: true,
          allDay: false,
          colorId: Math.floor(Math.random() * eventColours.length),
        }));
        setEvents(data);
      });
  }, []);

  const Schedule = ({ defaultCurrentView }: { defaultCurrentView: string }) => {
    const curDate = new Date(Date.now());
    const defaultCurrentDate =
      curDate < new Date("2023-1-13") || new Date("2023-1-15") < curDate
        ? new Date("2023-1-13")
        : curDate;
    return (
      <Scheduler
        className="h-full"
        dataSource={events}
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
    <div className="flex h-full flex-col">
      <Background />
      <div className="flex-initial">
        <NavBar />
      </div>
      <div className="flex-auto overflow-hidden p-9">
        <h1 className="text-lg font-bold">
          January 13th, 2023 - ALL DAY ONLINE
        </h1>
        {/* desktop view */}
        <div className="h-[95%] sm:hidden">
          <Schedule defaultCurrentView="agenda" />
        </div>
        {/* desktop view */}
        <div className="hidden h-[95%] sm:block">
          <Schedule defaultCurrentView="timelineDay" />
        </div>
      </div>
    </div>
  );
};

export default Schedule;
