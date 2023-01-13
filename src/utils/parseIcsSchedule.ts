import ICalParser from "ical-js-parser";

const parseICSSchedule = async () => {
  const json = ICalParser.toJSON(
    await (await fetch("./Final_Deltahacks_Schedule_-_FINAL.ics")).text()
  );

  return json.events.map((event) => {
    const startDate = event.dtstart.value;
    const endDate = event.dtend ? event.dtend.value : startDate;
    const location = event.location ? event.location : "N/A";
    const description = event.description ?? "";

    return {
      text: event.summary ?? "",
      startDate: startDate,
      endDate: endDate,
      allDay: event.dtstart.isAllDay ?? false,
      description: `Located in ${location}.\n\n${description}`,
    };
  });
};

export default parseICSSchedule;
