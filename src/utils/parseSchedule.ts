// TODO remove before merging
const fs = require("fs");
const Papa = require("papaparse");

const csvFilePath = "public/Final_Deltahacks_Schedule_-_FINAL.tsv";

const csvToArray = (csv) => {
  const rows = csv.split("\n");
  return rows.map((row) => {
    return row.split("\t");
  });
};

fs.readFile(csvFilePath, (err, data) => {
  if (err) throw err;

  const csv = csvToArray(data.toString());
  parseSchedule(csv);
});
// TODO end remove before merging

// interface ScheduleEvent {
//   range: [number, number];
//   event: string;
// }

// Parse the column of the csv
const parseColumn = (csv, schedule, day, col) => {
  let prevEvent = { event: "", row: -1 };

  for (let row = 2; row < csv.length; ++row) {
    if (csv[row][col] === "") continue;
    else if (prevEvent.event !== "") {
      // Parse all the events in the column
      schedule.get(day).events.push({
        range: [prevEvent.row, row - 1],
        event: prevEvent.event,
      });
    }

    prevEvent = { event: csv[row][col].trim(), row };
  }
};

const insertBlankSpaces = (schedule) => {
  // Name of event: their actual duration (in rows)
  // ? data doesn't represent blank spaces in the schedule so here's me hard coding it
  const EVENT_EXCEPTIONS = [
    ["Note", 0],
    ["Fire Drill Training at 10:00am - OUTSIDE (LOT G)", 1],
    ["Breakfast Clean-up (11:00 am)  - B138", 1],
    ["Lunch Clean-up (2:00) - B138", 1],
    ["Graph QL Workshop w/ HyperCare - 124", 2],
    ["Andriod APP w Afzal Najam (127)", 2],
    ["JAX Workshop, (ROOM 124)", 2],
    ["Dinner Setup (6:30) - B138", 1],
    ["Sponsor Showcase Cleanup - M21", 1],
    ["Cup Stacking Cleanup (10:00)", 1],
    ["Midnight Snack Cleanup (1:00)", 1],
    ["Sleeping room CLOSED/Clean up  - M12, M22, M24, M25", 1],
    ["Breakfast Clean-up (10:00 am)", 1],
    ["Submissions due at 12:00 pm", 1],
    ["Lunch Cleanup (1:30 pm) - B1381", 1],
    ["Closing Ceremony Setup (2:30 pm)", 1],
    ["Judging - M21 (4:00-5:00)", 2],
  ];

  for (const [event, duration] of EVENT_EXCEPTIONS) {
    for (const [day, { events }] of schedule.entries()) {
      for (let i = 0; i < events.length; ++i) {
        if (events[i].event !== event) continue;

        // Remove anything with duration 0
        if (duration === 0) {
          events.splice(i, 1);
        }

        events[i].range[1] = events[i].range[0] + duration - 1;
      }
    }
  }
};

const parseSchedule = (csv) => {
  let schedule = new Map();

  // Pre Processing
  // Add row of placeholders for last row in csv for algorithm
  csv.push(Array(csv[0].length).fill("A"));
  // Fill in the gaps in the time column
  for (let row = 3; row < csv.length; ++row) {
    if (csv[row][0] !== "") continue;
    csv[row][0] = csv[row - 1][0];
  }

  // read the first row to get the columns
  for (let i = 2; i < csv[0].length - 1; ++i) {
    if (csv[0][i] === "") continue;
    schedule.set(i, { events: [], day: csv[0][i].trim() });
  }

  // Read the data
  for (const [day, _] of schedule.entries()) {
    for (
      let col = day;
      (!schedule.has(col) || col === day) && col < csv[0].length - 1;
      ++col
    ) {
      parseColumn(csv, schedule, day, col);
    }
  }

  insertBlankSpaces(schedule);

  let schedule2 = [];
  for (const [i, j] of schedule.entries()) {
    for (const event of j.events) {
      schedule2.push({
        day: csv[0][i].trim(),
        range: [csv[event.range[0]][0], csv[event.range[1]][0]],
        event: event.event,
      });
    }
  }

  console.log(schedule2);
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
