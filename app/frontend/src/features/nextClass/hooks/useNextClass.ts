import { useState, useEffect, useCallback } from "react";
import { fetchUpcomingEvents } from "../../../services/calendarService";
import { findNextClass } from "../../../utils/nextClassFinder";
import {
  NextClassStatus,
  classifyNextClass,
  apiErrorStatus,
} from "../../../utils/nextClassErrors";

const REFRESH_INTERVAL_MS = 60_000;

/**
 * Orchestration hook: fetches events → finds next class → classifies status.
 *
 * Until Alex/Khaled deliver the real OAuth token and selected calendar IDs,
 * the caller can pass empty values and the hook will return `no_upcoming`.
 */
export const useNextClass = (
  accessToken: string | null,
  selectedCalendarIds: string[]
) => {
  const [status, setStatus] = useState<NextClassStatus>({ kind: "no_upcoming" });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!accessToken || selectedCalendarIds.length === 0) {
      setStatus({ kind: "no_upcoming" });
      return;
    }

    setLoading(true);
    try {
      const events = await fetchUpcomingEvents(accessToken, selectedCalendarIds);
      const next = findNextClass(events);
      setStatus(classifyNextClass(next));
    } catch (error) {
      setStatus(apiErrorStatus(error));
    } finally {
      setLoading(false);
    }
  }, [accessToken, selectedCalendarIds]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  return { status, loading, refresh };
};
