import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "../utils/mergeTailwind";

// This component is mostly vibe coded, because devextreme added a paywall
// Review and improve in future

const eventTypeColors = new Map([
  ["Event", { color: "#50d2de", bg: "bg-[#50d2de]", text: "text-gray-900" }],
  ["Workshop", { color: "#fed750", bg: "bg-[#fed750]", text: "text-gray-900" }],
  [
    "Important",
    { color: "#f8a0b0", bg: "bg-[#f8a0b0]", text: "text-gray-900" },
  ],
  ["Deadline", { color: "#c9b3fa", bg: "bg-[#c9b3fa]", text: "text-gray-900" }],
  ["Food", { color: "#7ee683", bg: "bg-[#7ee683]", text: "text-gray-900" }],
]);

const defaultColor = {
  color: "rgba(250, 250, 250, 88%)",
  bg: "bg-white/90",
  text: "text-gray-900",
};

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  eventType: string;
}

interface SchedulerProps {
  defaultView?: "day" | "agenda";
  startDate?: Date;
  intervalCount?: number;
}

const toMilitaryTime = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const militaryHours = hours < 10 ? "0" + hours : hours.toString();
  const militaryMinutes = minutes < 10 ? "0" + minutes : minutes.toString();
  return militaryHours + ":" + militaryMinutes;
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// Check if an event is active on a given date (handles multi-day events)
const isEventOnDate = (event: CalendarEvent, date: Date): boolean => {
  const eventStart = new Date(event.start.dateTime);
  const eventEnd = new Date(event.end.dateTime);

  // Normalize dates to start of day for comparison
  const dayStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const dayEnd = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 1,
  );

  // Event overlaps with this day if it starts before day ends AND ends after day starts
  return eventStart < dayEnd && eventEnd > dayStart;
};

const getEventColor = (eventType: string) => {
  return eventTypeColors.get(eventType) ?? defaultColor;
};

const eventsOverlap = (
  event1: CalendarEvent,
  event2: CalendarEvent,
): boolean => {
  const start1 = new Date(event1.start.dateTime).getTime();
  const end1 = new Date(event1.end.dateTime).getTime();
  const start2 = new Date(event2.start.dateTime).getTime();
  const end2 = new Date(event2.end.dateTime).getTime();
  return start1 < end2 && start2 < end1;
};

const calculateEventPositions = (
  events: CalendarEvent[],
  date: Date,
): Map<string, { column: number; totalColumns: number }> => {
  const positions = new Map<string, { column: number; totalColumns: number }>();

  const dayEvents = events
    .filter((event) => isEventOnDate(event, date))
    .sort((a, b) => {
      const startDiff =
        new Date(a.start.dateTime).getTime() -
        new Date(b.start.dateTime).getTime();
      if (startDiff !== 0) return startDiff;
      return (
        new Date(b.end.dateTime).getTime() - new Date(a.end.dateTime).getTime()
      );
    });

  const groups: CalendarEvent[][] = [];
  const visited = new Set<string>();

  for (const event of dayEvents) {
    if (visited.has(event.id)) continue;

    const group: CalendarEvent[] = [];
    const queue = [event];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current.id)) continue;
      visited.add(current.id);
      group.push(current);

      for (const other of dayEvents) {
        if (!visited.has(other.id) && eventsOverlap(current, other)) {
          queue.push(other);
        }
      }
    }

    if (group.length > 0) {
      groups.push(group);
    }
  }

  for (const group of groups) {
    const columns: CalendarEvent[][] = [];

    for (const event of group) {
      let placed = false;
      for (let col = 0; col < columns.length; col++) {
        const canPlace = columns[col]!.every((e) => !eventsOverlap(e, event));
        if (canPlace) {
          columns[col]!.push(event);
          positions.set(event.id, { column: col, totalColumns: 0 });
          placed = true;
          break;
        }
      }

      if (!placed) {
        columns.push([event]);
        positions.set(event.id, {
          column: columns.length - 1,
          totalColumns: 0,
        });
      }
    }

    const totalCols = columns.length;
    for (const event of group) {
      const pos = positions.get(event.id)!;
      positions.set(event.id, { ...pos, totalColumns: totalCols });
    }
  }

  return positions;
};

const CalendarView: React.FC<{
  events: CalendarEvent[];
  dates: Date[];
}> = ({ events, dates }) => {
  // Show all 24 hours (00:00 to 23:59)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const eventPositions = useMemo(() => {
    const allPositions = new Map<
      string,
      { column: number; totalColumns: number }
    >();
    for (const date of dates) {
      const datePositions = calculateEventPositions(events, date);
      datePositions.forEach((value, key) => allPositions.set(key, value));
    }
    return allPositions;
  }, [events, dates]);

  const getEventsForDateAndHour = (date: Date, hour: number) => {
    return events.filter((event) => {
      if (!isEventOnDate(event, date)) return false;

      const eventStart = new Date(event.start.dateTime);
      const eventEnd = new Date(event.end.dateTime);
      const isFirstDay = isSameDay(eventStart, date);
      const isLastDay = isSameDay(eventEnd, date);

      // Determine the effective start hour for this day
      const effectiveStartHour = isFirstDay ? eventStart.getHours() : 0;

      // Determine the effective end hour for this day
      let effectiveEndHour: number;
      let effectiveEndMinutes: number;
      if (isLastDay) {
        effectiveEndHour = eventEnd.getHours();
        effectiveEndMinutes = eventEnd.getMinutes();
      } else {
        // Event continues past this day
        effectiveEndHour = 24;
        effectiveEndMinutes = 0;
      }

      // Check if this hour slot is within the event's range for this day
      if (hour < effectiveStartHour) return false;
      if (hour > effectiveEndHour) return false;
      if (hour === effectiveEndHour && effectiveEndMinutes === 0) return false;

      return true;
    });
  };

  const getEventStyle = (event: CalendarEvent, date: Date, hour: number) => {
    const eventStart = new Date(event.start.dateTime);
    const eventEnd = new Date(event.end.dateTime);
    const isFirstDay = isSameDay(eventStart, date);
    const isLastDay = isSameDay(eventEnd, date);

    // Calculate effective start/end for this specific day
    const effectiveStartHour = isFirstDay ? eventStart.getHours() : 0;
    const effectiveStartMinutes = isFirstDay ? eventStart.getMinutes() : 0;

    let effectiveEndHour: number;
    let effectiveEndMinutes: number;
    if (isLastDay) {
      effectiveEndHour = eventEnd.getHours();
      effectiveEndMinutes = eventEnd.getMinutes();
    } else {
      effectiveEndHour = 24;
      effectiveEndMinutes = 0;
    }

    const durationHours =
      (effectiveEndHour * 60 +
        effectiveEndMinutes -
        (effectiveStartHour * 60 + effectiveStartMinutes)) /
      60;

    const position = eventPositions.get(event.id) || {
      column: 0,
      totalColumns: 1,
    };
    const { column, totalColumns } = position;

    const width =
      totalColumns > 1
        ? `calc(${100 / totalColumns}% - 2px)`
        : "calc(100% - 4px)";
    const left =
      totalColumns > 1
        ? `calc(${(column / totalColumns) * 100}% + 2px)`
        : "2px";

    if (hour === effectiveStartHour) {
      return {
        height: `calc(${Math.max(durationHours, 1) * 100}% + ${(Math.max(durationHours, 1) - 1) * 1}px)`,
        minHeight: "3.5rem",
        top: `${(effectiveStartMinutes / 60) * 100}%`,
        width,
        left,
      };
    }
    return null;
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
      <div className="flex h-full flex-col overflow-x-auto">
        <div className="flex flex-shrink-0 border-b border-gray-700 bg-gray-800">
          <div className="w-16 flex-shrink-0 border-r border-gray-700 p-2" />
          {dates.map((date, idx) => (
            <div
              key={idx}
              className="min-w-[140px] flex-1 border-r border-gray-700 p-3 text-center last:border-r-0"
            >
              <div className="whitespace-nowrap text-sm font-medium text-gray-300">
                {date.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex">
            <div className="w-16 flex-shrink-0 border-r border-gray-700">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="flex h-16 items-start justify-end border-b border-gray-700 pr-2 pt-1"
                >
                  <span className="text-xs text-gray-500">
                    {hour.toString().padStart(2, "0")}:00
                  </span>
                </div>
              ))}
            </div>

            {dates.map((date, dateIdx) => (
              <div
                key={dateIdx}
                className="min-w-[140px] flex-1 border-r border-gray-700 last:border-r-0"
              >
                {hours.map((hour) => {
                  const eventsInSlot = getEventsForDateAndHour(date, hour);
                  return (
                    <div
                      key={hour}
                      className="relative h-16 border-b border-gray-700"
                    >
                      {eventsInSlot.map((event) => {
                        const style = getEventStyle(event, date, hour);
                        // Only render event once per day (when style is returned)
                        if (!style) return null;
                        const color = getEventColor(event.eventType);
                        const eventStart = new Date(event.start.dateTime);
                        const eventEnd = new Date(event.end.dateTime);
                        const isFirstDay = isSameDay(eventStart, date);
                        const isLastDay = isSameDay(eventEnd, date);
                        // Show actual times on first/last day, otherwise show continuation
                        const startTime = isFirstDay
                          ? toMilitaryTime(eventStart)
                          : "00:00";
                        const endTime = isLastDay
                          ? toMilitaryTime(eventEnd)
                          : "23:59";

                        return (
                          <div
                            key={event.id}
                            className="absolute z-10 hover:z-20 origin-top-left"
                            style={style || undefined}
                          >
                            <div
                              className={cn(
                                "h-full overflow-hidden rounded-md px-2 py-1.5",
                                "border border-black/20 shadow-md shadow-black/30",
                                "ring-1 ring-inset ring-white/10",
                                "transition-all duration-200 ease-out",
                                "hover:h-auto hover:min-h-full hover:overflow-visible",
                                "hover:scale-[1.03] hover:shadow-lg hover:shadow-black/40",
                                color.bg,
                                color.text,
                              )}
                            >
                              <div className="text-xs font-medium leading-snug break-words">
                                {event.summary}
                              </div>
                              <div className="mt-0.5 text-xs leading-snug opacity-80 break-words">
                                {startTime} - {endTime}
                                {event.location && `, ${event.location}`}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const GOOGLE_CALENDAR_URL = "https://www.googleapis.com/calendar/v3/calendars/";
const CALENDAR_ID =
  "c_4d8a2a89a6a70c398354eba93e7dd292e6cf96d3e628be3f65c38624a5244254@group.calendar.google.com";
const PUBLIC_KEY = "AIzaSyBnNAISIUKe6xdhq1_rjor2rxoI3UlMY7k";
const DEFAULT_START_DATE = new Date(2026, 0, 9);

const fetchCalendarEvents = async (
  signal?: AbortSignal,
): Promise<CalendarEvent[]> => {
  const dataUrl = [
    GOOGLE_CALENDAR_URL,
    CALENDAR_ID,
    "/events?key=",
    PUBLIC_KEY,
  ].join("");

  const response = await fetch(dataUrl, { signal });
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  console.log("Raw calendar data:", data.items);

  return (data.items || [])
    .filter((event: any) => event.start && event.end)
    .map((event: any) => {
      const parts = event.summary?.split("|") || [];
      const eventType = parts.at(-1)?.trim() || "";
      const summaryWithoutTag =
        parts.length > 1 ? parts.slice(0, -1).join("|").trim() : event.summary;

      // Handle all-day events (have date instead of dateTime)
      const isAllDay = !event.start.dateTime;
      const start = isAllDay
        ? {
            dateTime: `${event.start.date}T08:00:00`,
            timeZone: event.start.timeZone,
          }
        : event.start;
      const end = isAllDay
        ? {
            dateTime: `${event.start.date}T09:00:00`,
            timeZone: event.end.timeZone,
          }
        : event.end;

      const mapped = {
        id: event.id,
        summary: summaryWithoutTag || "Untitled Event",
        description: event.description,
        location: event.location,
        start,
        end,
        eventType,
      };
      console.log("Mapped event:", {
        raw: event.summary,
        eventType,
        isAllDay,
        start,
        end,
      });
      return mapped;
    });
};

const AgendaView: React.FC<{
  events: CalendarEvent[];
  dates: Date[];
}> = ({ events, dates }) => {
  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();

    dates.forEach((date) => {
      const dateKey = date.toISOString().split("T")[0];
      const dayEvents = events
        .filter((event) => {
          const eventDate = new Date(event.start.dateTime);
          return isSameDay(eventDate, date);
        })
        .sort((a, b) => {
          return (
            new Date(a.start.dateTime).getTime() -
            new Date(b.start.dateTime).getTime()
          );
        });
      grouped.set(dateKey!, dayEvents);
    });

    return grouped;
  }, [events, dates]);

  return (
    <div className="h-full overflow-y-auto rounded-lg border border-gray-700 bg-gray-900">
      {dates.map((date) => {
        const dateKey = date.toISOString().split("T")[0];
        const dayEvents = eventsByDate.get(dateKey!) || [];

        return (
          <div
            key={dateKey}
            className="border-b border-gray-700 last:border-b-0"
          >
            <div className="sticky top-0 z-10 bg-gray-800 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-200">
                {date.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </h3>
            </div>

            <div className="divide-y divide-gray-700/50">
              {dayEvents.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  No events scheduled
                </div>
              ) : (
                dayEvents.map((event) => {
                  const color = getEventColor(event.eventType);
                  const startTime = toMilitaryTime(
                    new Date(event.start.dateTime),
                  );
                  const endTime = toMilitaryTime(new Date(event.end.dateTime));

                  return (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-gray-800/50"
                    >
                      <div
                        className="mt-1.5 h-3 w-3 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: color.color }}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-100">
                          {event.summary}
                        </div>
                        <div className="mt-0.5 text-xs text-gray-400">
                          {startTime} - {endTime}
                          {event.location && ` | ${event.location}`}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Scheduler: React.FC<SchedulerProps> = ({
  defaultView = "day",
  startDate = DEFAULT_START_DATE,
  intervalCount = 3,
}) => {
  const [view, setView] = useState<"day" | "agenda">(defaultView);

  const {
    data: events = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["calendar-events"],
    queryFn: ({ signal }) => fetchCalendarEvents(signal),
    staleTime: 5 * 60 * 1000,
  });

  const dates = useMemo(() => {
    const result: Date[] = [];
    for (let i = 0; i < intervalCount; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      result.push(date);
    }
    return result;
  }, [startDate, intervalCount]);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="hidden sm:flex rounded-lg bg-gray-800 p-1">
          <button
            onClick={() => setView("day")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              view === "day"
                ? "bg-gray-700 text-white"
                : "text-gray-400 hover:text-gray-200",
            )}
          >
            Calendar View
          </button>
          <button
            onClick={() => setView("agenda")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              view === "agenda"
                ? "bg-gray-700 text-white"
                : "text-gray-400 hover:text-gray-200",
            )}
          >
            List View
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg bg-gray-800 px-3 py-2">
          {Array.from(eventTypeColors).map(([eventType, color]) => {
            return (
              <div key={eventType} className="flex items-center gap-1.5">
                <div
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: color.color }}
                />
                <span className="text-xs text-gray-300">{eventType}</span>
              </div>
            );
          })}
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-gray-400">Loading events...</div>
        </div>
      )}

      {error && !isLoading && (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-red-400">
            Error:{" "}
            {error instanceof Error ? error.message : "Failed to load events"}
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <div className="flex-1 overflow-hidden">
          {view === "day" ? (
            <CalendarView events={events} dates={dates} />
          ) : (
            <AgendaView events={events} dates={dates} />
          )}
        </div>
      )}
    </div>
  );
};

export default Scheduler;
