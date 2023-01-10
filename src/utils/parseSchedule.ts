// TODO remove before pushing
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
// TODO end remove before pushing

// interface ScheduleEvent {
//   range: [number, number];
//   event: string;
// }

// Parse the column of the csv
const parseColumn = (csv, schedule, i, col) => {
  let prevEvent = { events: [], row: -1 };
  for (let row = 2; row < csv.length; ++row) {
    if (csv[row][col] === "") continue;
    else if (prevEvent.events.length && csv[row][0] !== "") {
      // Parse all the events in the column
      for (const event of prevEvent.events) {
        schedule.get(i).events.push({
          range: [csv[prevEvent.row][0], csv[row][0]],
          event: event,
        });
      }
      prevEvent = { events: [], row };
    }
  }
};

const parseSchedule = (csv) => {
  let schedule = new Map();

  // read the first row to get the columns
  for (let i = 2; i < csv[0].length; ++i) {
    if (csv[0][i] === "") continue;
    schedule.set(i, { events: [], day: csv[0][i].trim() });
  }

  // Add row of placeholders for last row in csv for algorithm
  csv.push(Array(csv[0].length).fill("A"));
  csv[csv.length - 1][0] = csv[csv.length - 2][0];

  // Read the data
  for (const [i, _] of schedule.entries()) {
    for (
      let col = i;
      (!schedule.has(col) || col === i) && col < csv[0].length;
      ++col
    ) {
      parseColumn(csv, schedule, i, col);
    }
  }

  for (const [i, j] of schedule.entries()) {
    console.log(i);
    for (const event of j.events) {
      console.log(event.range, event.event);
    }
  }
};
