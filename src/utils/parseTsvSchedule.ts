import { SchedulerDay, Scheduler2Event } from "../types/scheduler";

// Parse the column of the tsv
const parseColumn = (
  tsv: string[][],
  schedule: Map<number, SchedulerDay>,
  dayCol: number,
  col: number,
) => {
  let prevEvent = { event: "", row: -1 };

  for (let row = 2; row < tsv.length; ++row) {
    if (tsv[row]?.[col] === "") continue;
    else if (prevEvent.event !== "") {
      // Parse all the events in the column
      schedule.get(dayCol)?.events.push({
        range: [prevEvent.row, row - 1],
        event: prevEvent.event,
      });
    }

    prevEvent = { event: tsv[row]?.[col]?.trim() ?? "", row };
  }
};

const insertBlankSpaces = (schedule: Map<number, SchedulerDay>) => {
  // { event: Name of event, duration: their actual duration (in rows) }
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
    { event: "Group Formation Setup (11:30) - 124", duration: 1 },
    { event: "RBC Employer Event - 127", duration: 1 },
    { event: "React Workshop, (ROOM 124)", duration: 2 },
    { event: "Breakfast Clean-up (10:00 am)", duration: 1 },
    { event: "Submissions due at 12:00 pm", duration: 1 },
    { event: "Lunch Cleanup (1:30 pm) - B1381", duration: 1 },
    { event: "Closing Ceremony Setup (2:30 pm)", duration: 1 },
    { event: "Judging - M21 (4:00-5:00)", duration: 2 },
    { event: "Smash Event - 124", duration: 4 },
    { event: "Interview Preparation + Advice Workshop - ONLINE", duration: 2 },
    { event: "Closing Ceremony - PGCLL B138 5:30 pm - 6:30 pm", duration: 2 },
  ];

  // Change the duration for each event in EVENT_EXCEPTIONS
  for (const { event: eventException, duration } of EVENT_EXCEPTIONS) {
    schedule.forEach(({ events }) => {
      const remove: number[] = [];

      for (let i = 0; i < events.length; ++i) {
        if (events[i]?.event !== eventException) continue;

        // Mark anything with duration 0
        if (duration === 0) {
          remove.push(i);
          continue;
        }

        const event = events[i] ?? { range: [0, 0], event: "" };
        event.range[1] = event.range[0] + duration - 1;
      }

      // Remove duration 0 events
      const reverse = remove.reverse();
      for (let i = 0; i < reverse.length; ++i) {
        events.splice(reverse[i] ?? -1, 1);
      }
    });
  }
};

const parseTsv = (tsvOG: string[][]) => {
  // Copy tsvOG into tsv
  const tsv = tsvOG.map((row) => [...row]);
  const schedule = new Map<number, SchedulerDay>();

  // Pre Processing
  // Add row of placeholders for last row in tsv for algorithm
  tsv.push(Array(tsv[0]?.length).fill("A"));
  // Fill in the gaps in the time column
  for (let row = 3; row < tsv.length; ++row) {
    const rowArr = tsv[row] ?? [];
    if (rowArr[0] !== "") continue;
    rowArr[0] = tsv[row - 1]?.[0] ?? "";
  }

  // read the first row to get the columns
  const firstRow = tsv[0] ?? [];
  for (let i = 2; i < firstRow.length - 1; ++i) {
    if (firstRow[i] === "") continue;
    schedule.set(i, { events: [], day: firstRow[i]?.trim() ?? "" });
  }

  // Read the data
  schedule.forEach((_, dayCol) => {
    for (
      let col = dayCol;
      (!schedule.has(col) || col === dayCol) && col < (tsv[0]?.length ?? 0) - 1;
      ++col
    ) {
      parseColumn(tsv, schedule, dayCol, col);
    }
  });

  insertBlankSpaces(schedule);

  // Map the data to the devextreme scheduler data format
  const schedule2: Scheduler2Event[] = [];
  schedule.forEach(({ events }, col) => {
    for (const event of events) {
      const day = tsv[0]?.[col]?.trim() ?? "";
      const start = tsv[event.range[0]]?.[0]?.split("-")[0] ?? "";
      const end = tsv[event.range[1]]?.[0]?.split("-")[1] ?? "";

      // Remove time stamps from event.event
      // const text = event.event.replace(
      //   /\(?\d{1,2}:\d{1,2} ?(am|pm)?( ?- ?\d{1,2}:\d\d ?(am|pm)?)?\)? ?/g,
      //   ""
      // );

      schedule2.push({
        text: event.event,
        startDate: new Date(`${day} ${start}`),
        endDate: new Date(`${day} ${end}`),
      });
    }
  });

  return schedule2;

  // log the schedule
  // for (const [i, j] of schedule.entries()) {
  //   console.log(i);
  //   for (const event of j.events) {
  //     console.log(
  //       [tsv[event.range[0]][0], tsv[event.range[1]][0]],
  //       event.event
  //     );
  //   }
  // }
};

const tsvToArray = (csv: string) => {
  const rows = csv.split("\n");
  return rows.map((row) => {
    return row.split("\t");
  });
};

// Read from the file parse it
const parseTsvSchedule = async () => {
  const response = await (
    await fetch("./Final_Deltahacks_Schedule_-_FINAL.tsv")
  ).text();
  const tsv = parseTsv(tsvToArray(response));
  return tsv;
};

export default parseTsvSchedule;
