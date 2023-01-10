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
//   day: string;
//   event: string;
// }

const parseSchedule = (csv) => {
  let schedule = new Map();
  let len = 0;
  for (let i = 0; i < csv[0].length; ++i) {
    if (csv[0][i] === "") continue;
    schedule.set(i, { events: [], day: csv[0][i].trim() });
    len = Math.max(len, i);
  }
};
