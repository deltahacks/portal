// TODO remove before merging
// const fs = require("fs");

// const csvFilePath = "public/Final_Deltahacks_schedule_-_FINAL.tsv";

// const csvToArray = (csv) => {
//   const rows = csv.split("\n");
//   return rows.map((row) => { //     return row.split("\t"); //   });
// };

// fs.readFile(csvFilePath, (err, data) => {
//   if (err) throw err;

//   const csv = csvToArray(data.toString());
//   parseschedule(csv);
// });
// TODO end remove before merging

interface ScheduleEvent {
  range: [number, number];
  event: string;
}

interface Schedule2Event {
  range: [Date, Date];
  event: string;
}

interface ScheduleDay {
  events: ScheduleEvent[];
  day: string;
}

// Parse the column of the csv
const parseColumn = (
  csv: string[][],
  schedule: Map<number, ScheduleDay>,
  dayCol: number,
  col: number
) => {
  let prevEvent = { event: "", row: -1 };

  for (let row = 2; row < csv.length; ++row) {
    if (csv[row]?.[col] === "") continue;
    else if (prevEvent.event !== "") {
      // Parse all the events in the column
      schedule.get(dayCol)?.events.push({
        range: [prevEvent.row, row - 1],
        event: prevEvent.event,
      });
    }

    prevEvent = { event: csv[row]?.[col]?.trim() ?? "", row };
  }
};

const insertBlankSpaces = (schedule: Map<number, ScheduleDay>) => {
  // Name of event: their actual duration (in rows)
  // ? data doesn't represent blank spaces in the schedule so here's me hard coding it
  const EVENT_EXCEPTIONS = [
    { event: "Note", duration: 0 },
    { event: "Fire Drill Training at 10:00am - OUTSIDE (LOT G)", duration: 1 },
    { event: "Breakfast Clean-up (11:00 am)  - B138", duration: 1 },
    { event: "Lunch Clean-up (2:00) - B138", duration: 1 },
    { event: "Graph QL Workshop w/ HyperCare - 124", duration: 2 },
    { event: "Andriod APP w Afzal Najam (127)", duration: 2 },
    { event: "JAX Workshop, (ROOM 124)", duration: 2 },
    { event: "Dinner Setup (6:30) - B138", duration: 1 },
    { event: "Sponsor Showcase Cleanup - M21", duration: 1 },
    { event: "Cup Stacking Cleanup (10:00)", duration: 1 },
    { event: "Midnight Snack Cleanup (1:00)", duration: 1 },
    {
      event: "Sleeping room CLOSED/Clean up  - M12, M22, M24, M25",
      duration: 1,
    },
    { event: "Breakfast Clean-up (10:00 am)", duration: 1 },
    { event: "Submissions due at 12:00 pm", duration: 1 },
    { event: "Lunch Cleanup (1:30 pm) - B1381", duration: 1 },
    { event: "Closing Ceremony Setup (2:30 pm)", duration: 1 },
    { event: "Judging - M21 (4:00-5:00)", duration: 2 },
  ];

  for (const { event: eventException, duration } of EVENT_EXCEPTIONS) {
    schedule.forEach(({ events }) => {
      for (let i = 0; i < events.length; ++i) {
        if (events[i]?.event !== eventException) continue;

        // Remove anything with duration 0
        if (duration === 0) {
          events.splice(i, 1);
        }
        const event = events[i] ?? { range: [0, 0], event: "" };
        event.range[1] = event.range[0] + duration - 1;
      }
    });
  }
};

const parseSchedule = (csv: string[][]) => {
  const schedule = new Map<number, ScheduleDay>();

  // Pre Processing
  // Add row of placeholders for last row in csv for algorithm
  csv.push(Array(csv[0]?.length).fill("A"));
  // Fill in the gaps in the time column
  for (let row = 3; row < csv.length; ++row) {
    const rowArr = csv[row] ?? [];
    if (rowArr[0] !== "") continue;
    rowArr[0] = csv[row - 1]?.[0] ?? "";
  }

  // read the first row to get the columns
  const firstRow = csv[0] ?? [];
  for (let i = 2; i < firstRow.length - 1; ++i) {
    if (firstRow[i] === "") continue;
    schedule.set(i, { events: [], day: firstRow[i]?.trim() ?? "" });
  }

  // Read the data
  schedule.forEach((_, dayCol) => {
    for (
      let col = dayCol;
      (!schedule.has(col) || col === dayCol) && col < (csv[0]?.length ?? 0) - 1;
      ++col
    ) {
      parseColumn(csv, schedule, dayCol, col);
    }
  });

  insertBlankSpaces(schedule);

  const schedule2: Schedule2Event[] = [];
  schedule.forEach(({ events }, col) => {
    for (const event of events) {
      const day = csv[0]?.[col]?.trim() ?? "";
      const start = csv[event.range[0]]?.[0]?.split("-")[0] ?? "";
      const end = csv[event.range[1]]?.[0]?.split("-")[1] ?? "";
      schedule2.push({
        range: [new Date(`${day} ${start}`), new Date(`${day} ${end}`)],
        event: event.event,
      });
    }
  });

  return schedule2;

  // log the schedule
  // for (const [i, j] of schedule.entries()) {
  //   console.log(i);
  //   for (const event of j.events) {
  //     console.log(
  //       [csv[event.range[0]][0], csv[event.range[1]][0]],
  //       event.event
  //     );
  //   }
  // }
};

export default parseSchedule;
