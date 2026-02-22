import axios from "axios";

export interface GoogleCalendar {
  id: string;
  summary: string;
  primary?: boolean;
}

const GOOGLE_CALENDAR_API_URL =
  "https://www.googleapis.com/calendar/v3/users/me/calendarList";

export const fetchGoogleCalendars = async (
  accessToken: string
): Promise<GoogleCalendar[]> => {
  try {
    const response = await axios.get(GOOGLE_CALENDAR_API_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data.items.map((calendar: any) => ({
      id: calendar.id,
      summary: calendar.summary,
      primary: calendar.primary,
    }));
  } catch (error) {
    console.error("Error fetching Google calendars:", error);
    throw error;
  }
};