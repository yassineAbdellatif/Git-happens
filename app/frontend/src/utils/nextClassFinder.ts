import { CalendarEvent, NextClassInfo } from "../types/calendarTypes";
import { parseLocation } from "./locationParser";

/**
 * Given a flat list of calendar events (potentially from multiple calendars),
 * returns the single NextClassInfo for the closest future timed event.
 *
 * Filters out:
 *  - all-day events  (start.date present, start.dateTime absent)
 *  - cancelled events (status === "cancelled")
 *  - events whose start time is in the past relative to `now`
 *
 * Returns null when no qualifying event exists.
 */
export const findNextClass = (
  events: CalendarEvent[],
  now: Date = new Date()
): NextClassInfo | null => {
  const upcoming = events
    .filter((e) => {
      if (e.status === "cancelled") return false;
      if (!e.start.dateTime) return false;
      const start = new Date(e.start.dateTime);
      return start.getTime() > now.getTime();
    })
    .sort((a, b) => {
      const aTime = new Date(a.start.dateTime!).getTime();
      const bTime = new Date(b.start.dateTime!).getTime();
      return aTime - bTime;
    });

  if (upcoming.length === 0) return null;

  const event = upcoming[0];
  const location = parseLocation(event.location) ?? parseLocation(event.summary);

  return {
    event,
    location,
    startTime: new Date(event.start.dateTime!),
    courseName: event.summary,
  };
};
