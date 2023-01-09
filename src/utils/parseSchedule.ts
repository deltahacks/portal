// TODO remove before pushing
const fs = require("fs");
const Papa = require("papaparse");

const csvFilePath = "public/Final_Deltahacks_Schedule_-_FINAL.csv";

const csvToArray = (csv) => {
  const rows = csv.split("\n");
  return rows.map((row) => {
    return row.split(",");
  });
};

fs.readFile(csvFilePath, (err, data) => {
  if (err) throw err;

  const csv = csvToArray(data.toString());
  parseSchedule(csv);
});
// TODO end remove before pushing

const parseSchedule = (csv) => {
  console.log(csv);
};
