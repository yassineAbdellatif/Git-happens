import axios from "axios";

const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

export interface GoogleCalendarListItem {
  id: string;
  summary: string;
  primary?: boolean;
  backgroundColor?: string;
  foregroundColor?: string;
  accessRole?: string;
}

export interface FetchCalendarListResult {
  error: "token_expired" | "api_error" | "network_error" | null;
  message?: string;
  calendars: GoogleCalendarListItem[];
}

/**
 * Fetches the user's calendar list from Google Calendar API.
 * Requires OAuth2 access token with calendar.readonly scope (from US-3.1).
 */
export const fetchCalendarList = async (
  accessToken: string
): Promise<FetchCalendarListResult> => {
  const url = `${GOOGLE_CALENDAR_API}/users/me/calendarList`;

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { maxResults: 50 },
      timeout: 10000,
    });

    const items = response.data.items ?? [];
    const calendars: GoogleCalendarListItem[] = items.map(
      (item: {
        id: string;
        summary?: string;
        primary?: boolean;
        backgroundColor?: string;
        foregroundColor?: string;
        accessRole?: string;
      }) => ({
        id: item.id,
        summary: item.summary ?? "Untitled Calendar",
        primary: item.primary ?? false,
        backgroundColor: item.backgroundColor,
        foregroundColor: item.foregroundColor,
        accessRole: item.accessRole,
      })
    );

    return { error: null, calendars };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.error?.message ?? error.message;

      if (status === 401 || status === 403) {
        return {
          calendars: [],
          error: "token_expired",
          message:
            status === 401
              ? "Session expired. Please reconnect your Google Calendar."
              : "Access denied. Please reconnect your Google Calendar.",
        };
      }

      return {
        calendars: [],
        error: "api_error",
        message: message || "Could not load calendars.",
      };
    }

    return {
      calendars: [],
      error: "network_error",
      message: "Network error. Check your connection.",
    };
  }
};
