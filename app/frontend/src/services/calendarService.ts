import axios from "axios";
import { CalendarEvent } from "../types/calendarTypes";

const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

/**
 * Fetches events from a single Google Calendar within a time range.
 *
 * Requires a valid OAuth2 access token with `calendar.readonly` scope.
 */
const fetchEventsForCalendar = async (
  accessToken: string,
  calendarId: string,
  timeMin: string,
  timeMax: string,
  maxResults: number = 250,
): Promise<CalendarEvent[]> => {
  const url = `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`;

  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: {
      timeMin,
      timeMax,
      maxResults,
      singleEvents: true,
      orderBy: "startTime",
    },
    timeout: 10000,
  });

  return (response.data.items ?? []) as CalendarEvent[];
};

/**
 * Fetches events from multiple selected calendars within a time range,
 * merges them, and returns a single sorted-by-start-time array.
 *
 * Fetches events from 3 months ago to 6 months in the future to allow
 * browsing past and future weeks.
 *
 * Gracefully skips any calendar that fails (e.g. revoked access) and
 * returns whatever it can collect from the rest.
 */
export const fetchUpcomingEvents = async (
  accessToken: string,
  calendarIds: string[],
): Promise<CalendarEvent[]> => {
  if (!accessToken || calendarIds.length === 0) return [];

  // Fetch events from 3 months ago to 6 months in the future
  const now = new Date();
  const timeMin = new Date(
    now.getFullYear(),
    now.getMonth() - 3,
    now.getDate(),
  ).toISOString();
  const timeMax = new Date(
    now.getFullYear(),
    now.getMonth() + 6,
    now.getDate(),
  ).toISOString();

  const results = await Promise.allSettled(
    calendarIds.map((id) =>
      fetchEventsForCalendar(accessToken, id, timeMin, timeMax),
    ),
  );

  const events: CalendarEvent[] = [];
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === "fulfilled") {
      events.push(...result.value);
    } else {
      const calendarId = calendarIds[i];
      console.warn(
        `[calendarService] Failed to fetch events for calendar ${calendarId}:`,
        result.reason,
      );
    }
  }

  events.sort((a, b) => {
    const aTime = a.start.dateTime
      ? new Date(a.start.dateTime).getTime()
      : Infinity;
    const bTime = b.start.dateTime
      ? new Date(b.start.dateTime).getTime()
      : Infinity;
    return aTime - bTime;
  });

  return events;
};
