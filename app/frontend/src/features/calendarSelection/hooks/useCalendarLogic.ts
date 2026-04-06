import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useCalendarSelection } from "../../../context/CalendarSelectionContext";
import {
  fetchCalendarList,
  GoogleCalendarListItem,
} from "../../../services/calendarListService";

export type CalendarErrorType =
  | "token_expired"
  | "api_error"
  | "network_error"
  | "empty";

export interface CalendarError {
  type: CalendarErrorType;
  message: string;
}

export const useCalendarLogic = (navigation?: { goBack?: () => void }) => {
  const {
    googleCalendarAccessToken,
    getValidAccessToken,
    selectedCalendarIds,
    setSelectedCalendarIds,
    confirmSelection,
  } = useCalendarSelection();

  const [calendars, setCalendars] = useState<GoogleCalendarListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<CalendarError | null>(null);

  // Helper: filter selected IDs that still exist in fetched calendars
  const filterValidIds = useCallback(
    (ids: string[], availableCalendars: GoogleCalendarListItem[]) => {
      return ids.filter((id) =>
        availableCalendars.some((c) => c.id === id)
      );
    },
    []
  );

  // Helper: handle token expired or fetch error
  const fetchCalendarsWithToken = useCallback(async (token: string) => {
    let result = await fetchCalendarList(token);

    if (result.error === "token_expired") {
      const refreshedToken = await getValidAccessToken();
      if (refreshedToken && refreshedToken !== token) {
        result = await fetchCalendarList(refreshedToken);
      }
    }

    return result;
  }, [getValidAccessToken]);

  const loadCalendars = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = await getValidAccessToken();
    if (!token) {
      setError({
        type: "empty",
        message: "Connect Google Calendar to select calendars.",
      });
      setCalendars([]);
      setLoading(false);
      return;
    }

    const result = await fetchCalendarsWithToken(token);
    setLoading(false);

    if (result.error) {
      setError({
        type: result.error as CalendarErrorType,
        message: result.message ?? "Something went wrong.",
      });
      setCalendars([]);
      return;
    }

    if (result.calendars.length === 0) {
      setError({
        type: "empty",
        message: "No calendars found. Create a calendar in Google Calendar first.",
      });
      setCalendars([]);
      return;
    }

    setCalendars(result.calendars);
    setSelectedCalendarIds((prev) => filterValidIds(prev, result.calendars));
  }, [getValidAccessToken, setSelectedCalendarIds, fetchCalendarsWithToken, filterValidIds]);

  useEffect(() => {
    loadCalendars();
  }, [loadCalendars]);

  const toggleCalendar = useCallback(
    (id: string) => {
      setSelectedCalendarIds((prev) =>
        prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
      );
    },
    [setSelectedCalendarIds]
  );

  const handleConfirm = useCallback(async () => {
    if (selectedCalendarIds.length === 0) {
      Alert.alert(
        "No calendars selected",
        "Please select at least one calendar to continue.",
        [{ text: "OK" }]
      );
      return;
    }

    await confirmSelection();
    Alert.alert(
      "Saved",
      `${selectedCalendarIds.length} calendar(s) selected.`,
      [{ text: "OK" }]
    );
  }, [selectedCalendarIds.length, confirmSelection]);

  return {
    hasToken: !!googleCalendarAccessToken,
    calendars,
    loading,
    error,
    selectedCalendarIds,
    loadCalendars,
    toggleCalendar,
    handleConfirm,
  };
};