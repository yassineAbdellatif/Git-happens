import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { useCalendarSelection } from "../../../context/CalendarSelectionContext";
import { fetchCalendarList, GoogleCalendarListItem } from "../../../services/calendarListService";

export type CalendarErrorType = "token_expired" | "api_error" | "network_error" | "empty";

export interface CalendarError {
  type: CalendarErrorType;
  message: string;
}

export const useCalendarLogic = (navigation?: { goBack?: () => void }) => {
  const {
    googleCalendarAccessToken,
    selectedCalendarIds,
    setSelectedCalendarIds,
    confirmSelection,
  } = useCalendarSelection();

  const [calendars, setCalendars] = useState<GoogleCalendarListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<CalendarError | null>(null);

  const loadCalendars = useCallback(async () => {
    if (!googleCalendarAccessToken) {
      setError({ type: "empty", message: "Connect Google Calendar to select calendars." });
      setCalendars([]);
      return;
    }

    setLoading(true);
    setError(null);
    const result = await fetchCalendarList(googleCalendarAccessToken);
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
    setError(null);

    setSelectedCalendarIds((prev) =>
      prev.filter((id) => result.calendars.some((c) => c.id === id))
    );
  }, [googleCalendarAccessToken, setSelectedCalendarIds]);

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
    Alert.alert("Saved", `${selectedCalendarIds.length} calendar(s) selected.`, [
      { text: "OK", onPress: () => navigation?.goBack?.() },
    ]);
  }, [selectedCalendarIds.length, confirmSelection, navigation]);

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
