import { NextPage } from "next";
import React, { useState } from "react";
import Scheduler, { Resource } from "devextreme-react/scheduler";
import Background from "../components/Background";
import NavBar from "../components/NavBar";
import parseSchedule from "../utils/parseSchedule";

import "devextreme/dist/css/dx.dark.css";

interface Event {
  text: string;
  startDate: Date;
  endDate: Date;
  disabled: boolean;
}

const test = [
  {
    disabled: true,
    startDate: new Date(
      "Sat Jan 14 2023 11:30:00 GMT-0500 (Eastern Standard Time)"
    ),
    endDate: new Date(
      "Sat Jan 14 2023 20:30:00 GMT-0500 (Eastern Standard Time)"
    ),
    text: "Group Formation Setup (11:30) - 124",
  },
];

const currentDate = Date.now();

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
        const tsv = csvToArray(response);
        setEvents(parseSchedule(tsv));
      });
  }, []);

  return (
    <div className="flex h-full flex-col">
      <Background />
      <div className="flex-initial">
        <NavBar />
      </div>
      <div className="flex-auto p-9">
        <Scheduler
          className="h-[95%]"
          dataSource={events}
          views={["timelineDay"]}
          defaultCurrentView="timelineDay"
          defaultCurrentDate={currentDate}
          cellDuration={60}
          firstDayOfWeek={0}
          onCellClick={(e) => {
            e.cancel = true;
          }}
        />
      </div>
    </div>
  );
};

export default Schedule;
