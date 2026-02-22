import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../features/auth/config/firebaseConfig";

const SELECTED_CALENDARS_KEY = "@campus_guide_selected_calendars";

interface CalendarSelectionContextValue {
  googleCalendarAccessToken: string | null;
  setGoogleCalendarAccessToken: (token: string | null) => void;
  selectedCalendarIds: string[];
  setSelectedCalendarIds: (ids: string[] | ((prev: string[]) => string[])) => void;
  confirmSelection: () => Promise<void>;
  clearCalendarState: () => Promise<void>;
}

const CalendarSelectionContext = createContext<CalendarSelectionContextValue | null>(null);

export const useCalendarSelection = () => {
  const ctx = useContext(CalendarSelectionContext);
  if (!ctx) {
    throw new Error("useCalendarSelection must be used within CalendarSelectionProvider");
  }
  return ctx;
};

export const CalendarSelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [googleCalendarAccessToken, setGoogleCalendarAccessToken] = useState<string | null>(null);
  const [selectedCalendarIds, setSelectedCalendarIdsState] = useState<string[]>([]);
  const idsRef = useRef<string[]>([]);
  idsRef.current = selectedCalendarIds;

  const setSelectedCalendarIds = useCallback(
    (idsOrUpdater: string[] | ((prev: string[]) => string[])) => {
      setSelectedCalendarIdsState((prev) => {
        const next = typeof idsOrUpdater === "function" ? idsOrUpdater(prev) : idsOrUpdater;
        return next;
      });
    },
    []
  );

  const persistSelection = useCallback(async (ids: string[]) => {
    try {
      await AsyncStorage.setItem(SELECTED_CALENDARS_KEY, JSON.stringify(ids));
    } catch (e) {
      console.warn("Failed to persist calendar selection:", e);
    }
  }, []);

  const loadPersistedSelection = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(SELECTED_CALENDARS_KEY);
      if (stored) {
        const ids = JSON.parse(stored) as string[];
        if (Array.isArray(ids)) {
          setSelectedCalendarIdsState(ids);
        }
      }
    } catch (e) {
      console.warn("Failed to load persisted calendar selection:", e);
    }
  }, []);

  const confirmSelection = useCallback(async () => {
    await persistSelection(idsRef.current);
  }, [persistSelection]);

  const clearCalendarState = useCallback(async () => {
    setGoogleCalendarAccessToken(null);
    setSelectedCalendarIdsState([]);
    try {
      await AsyncStorage.removeItem(SELECTED_CALENDARS_KEY);
    } catch (e) {
      console.warn("Failed to clear persisted calendar selection:", e);
    }
  }, []);

  useEffect(() => {
    loadPersistedSelection();
  }, [loadPersistedSelection]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        clearCalendarState();
      }
    });
    return () => unsubscribe();
  }, [clearCalendarState]);

  const value: CalendarSelectionContextValue = {
    googleCalendarAccessToken,
    setGoogleCalendarAccessToken,
    selectedCalendarIds,
    setSelectedCalendarIds,
    confirmSelection,
    clearCalendarState,
  };

  return (
    <CalendarSelectionContext.Provider value={value}>
      {children}
    </CalendarSelectionContext.Provider>
  );
};
