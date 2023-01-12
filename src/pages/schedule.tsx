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
        const csv = csvToArray(response);
        setEvents(parseSchedule(csv));
      });

    setTimeout(() => {
      const timeline =
        document.querySelector(".dx-scheduler-work-space") ??
        document.createElement("div");
    }, 250);
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
          timeZone="America/Los_Angeles"
          dataSource={events}
          views={["timelineDay"]}
          defaultCurrentView="timelineDay"
          defaultCurrentDate={currentDate}
          cellDuration={60}
          firstDayOfWeek={0}
          startDayHour={8}
          endDayHour={20}
        />
      </div>
    </div>
  );
};

export default Schedule;
