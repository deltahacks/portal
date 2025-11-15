import ICalParser from "ical-js-parser";

const parseTime = (time: string) => {
  let date = time;
  // If the time is in the format YYYYMMDD
  if (time.length === 8) {
    date = `${time.slice(0, 4)}-${time.slice(4, 6)}-${time.slice(6, 8)}`;
    // If the time is in the format YYYYMMDDTHHMMSSZ
  } else if (time.length === 16) {
    date = `${time.slice(0, 4)}-${time.slice(4, 6)}-${time.slice(
      6,
      8,
    )}T${time.slice(9, 11)}:${time.slice(11, 13)}:${time.slice(13, 15)}Z`;
  }
  return new Date(date);
};

const parseICSSchedule = async () => {
  // Fetch the calendar
  const json = ICalParser.toJSON(await (await fetch("/api/cal")).text());

  const data = json.events
    .map((event) => {
      const isAllDay =
        event.summary === "HACKATHON" || (event.dtstart.isAllDay ?? false);
      const startDate = parseTime(event.dtstart.value);
      const endDate = event.dtend ? parseTime(event.dtend.value) : startDate;
      const location = event.location ? event.location : "N/A";
      const description = event.description ?? "";
      const completeDescription = `Located in ${location}.${
        description && "\n\n"
      }${description}`.replaceAll("\\", "");

      return {
        text: event.summary ?? "",
        startDate: startDate,
        endDate: endDate,
        allDay: isAllDay,
        description: completeDescription,
      };
    })
    // Filter out the organizer events
    .filter((event) => event.description.indexOf("Organizer") === -1)
    // Port All Day events first
    .sort((a) => (a.allDay ? -1 : 1));

  return data;
};

export default parseICSSchedule;
