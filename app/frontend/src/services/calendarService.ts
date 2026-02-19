import axios from "axios";
import { CalendarEvent } from "../types/calendarTypes";

const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

/**
 * Fetches upcoming (future-only) events from a single Google Calendar.
 *
 * Requires a valid OAuth2 access token with `calendar.readonly` scope.
 * The token will come from Alex's US-3.1 OAuth flow once it's wired in.
 */
const fetchEventsForCalendar = async (
  accessToken: string,
  calendarId: string,
  timeMin: string,
  maxResults: number = 10
): Promise<CalendarEvent[]> => {
  const url = `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`;

  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: {
      timeMin,
      maxResults,
      singleEvents: true,
      orderBy: "startTime",
    },
    timeout: 10000,
  });

  return (response.data.items ?? []) as CalendarEvent[];
};

/**
 * Fetches upcoming events from multiple selected calendars, merges them,
 * and returns a single sorted-by-start-time array.
 *
 * Gracefully skips any calendar that fails (e.g. revoked access) and
 * returns whatever it can collect from the rest.
 */
export const fetchUpcomingEvents = async (
  accessToken: string,
  calendarIds: string[]
): Promise<CalendarEvent[]> => {
  if (!accessToken || calendarIds.length === 0) return [];

  const timeMin = new Date().toISOString();

  const results = await Promise.allSettled(
    calendarIds.map((id) => fetchEventsForCalendar(accessToken, id, timeMin))
  );

  const events: CalendarEvent[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      events.push(...result.value);
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
