import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useCalendarSelection } from "../../../context/CalendarSelectionContext";
import { fetchCalendarList, GoogleCalendarListItem } from "../../../services/calendarListService";

export const CalendarSelectionScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const {
    googleCalendarAccessToken,
    selectedCalendarIds,
    setSelectedCalendarIds,
    confirmSelection,
  } = useCalendarSelection();

  const [calendars, setCalendars] = useState<GoogleCalendarListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{
    type: "token_expired" | "api_error" | "network_error" | "empty";
    message: string;
  } | null>(null);

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
        type: result.error,
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
  }, [googleCalendarAccessToken]);

  useEffect(() => {
    loadCalendars();
  }, [loadCalendars]);

  const toggleCalendar = (id: string) => {
    setSelectedCalendarIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleConfirm = async () => {
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
  };

  if (!googleCalendarAccessToken) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="event-busy" size={64} color="#ccc" />
        <Text style={styles.title}>Connect Google Calendar</Text>
        <Text style={styles.subtitle}>
          Sign in with Google Calendar to view and select your calendars for class schedules.
        </Text>
        <Text style={styles.hint}>
          This screen will show your calendars once the Google Calendar connection (US-3.1) is
          complete.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#912338" />
        <Text style={styles.loadingText}>Loading your calendars...</Text>
      </View>
    );
  }

  if (error && error.type !== "token_expired") {
    const isEmpty = error.type === "empty";
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons
          name={isEmpty ? "folder-off" : "error-outline"}
          size={64}
          color={isEmpty ? "#999" : "#c62828"}
        />
        <Text style={styles.title}>{isEmpty ? "No Calendars" : "Could not load calendars"}</Text>
        <Text style={styles.subtitle}>{error.message}</Text>
        {!isEmpty && (
          <TouchableOpacity style={styles.retryButton} onPress={loadCalendars}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (error?.type === "token_expired") {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="vpn-key" size={64} color="#f57c00" />
        <Text style={styles.title}>Session expired</Text>
        <Text style={styles.subtitle}>{error.message}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadCalendars}>
          <Text style={styles.retryButtonText}>Reconnect</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Select Calendars</Text>
        <Text style={styles.headerSubtitle}>
          Choose which calendars to use for your class schedule.
        </Text>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {calendars.map((cal) => {
          const isSelected = selectedCalendarIds.includes(cal.id);
          return (
            <TouchableOpacity
              key={cal.id}
              style={[styles.calendarItem, isSelected && styles.calendarItemSelected]}
              onPress={() => toggleCalendar(cal.id)}
              activeOpacity={0.7}
            >
              <View style={styles.calendarItemLeft}>
                <View
                  style={[
                    styles.colorDot,
                    { backgroundColor: cal.backgroundColor ?? "#912338" },
                  ]}
                />
                <View>
                  <Text style={styles.calendarName} numberOfLines={1}>
                    {cal.summary}
                  </Text>
                  {cal.primary && (
                    <Text style={styles.primaryBadge}>Primary</Text>
                  )}
                </View>
              </View>
              <MaterialIcons
                name={isSelected ? "check-circle" : "radio-button-unchecked"}
                size={24}
                color={isSelected ? "#912338" : "#999"}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.selectedCount}>
          {selectedCalendarIds.length} calendar(s) selected
        </Text>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            selectedCalendarIds.length === 0 && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={selectedCalendarIds.length === 0}
        >
          <MaterialIcons name="check" size={20} color="white" />
          <Text style={styles.confirmButtonText}>Confirm Selection</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  header: {
    backgroundColor: "white",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 6,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  calendarItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  calendarItemSelected: {
    borderWidth: 2,
    borderColor: "#912338",
    backgroundColor: "#fff5f5",
  },
  calendarItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  calendarName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  primaryBadge: {
    fontSize: 11,
    color: "#912338",
    marginTop: 2,
  },
  footer: {
    backgroundColor: "white",
    padding: 20,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  selectedCount: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  confirmButton: {
    backgroundColor: "#912338",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  confirmButtonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.8,
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 24,
  },
  hint: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 16,
    fontStyle: "italic",
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    marginTop: 12,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#912338",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
