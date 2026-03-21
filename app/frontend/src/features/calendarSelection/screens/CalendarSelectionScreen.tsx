import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useCalendarLogic } from "../hooks/useCalendarLogic";
import ScheduleScreen from "./ScheduleScreen";
import { styles } from "../styles/CalendarStyle";

export const CalendarSelectionScreen: React.FC<{ navigation?: any }> = ({
  navigation,
}) => {
  const [showSchedule, setShowSchedule] = useState(false);

  const {
    hasToken,
    loading,
    error,
    calendars,
    selectedCalendarIds,
    toggleCalendar,
    handleConfirm: originalHandleConfirm,
    loadCalendars,
  } = useCalendarLogic(navigation);

  const handleConfirm = async () => {
    await originalHandleConfirm();
    setShowSchedule(true);
  };

  // If we've confirmed selection, show the schedule
  if (showSchedule) {
    return (
      <ScheduleScreen
        navigation={navigation}
        onBackToSelection={() => setShowSchedule(false)}
      />
    );
  }

  if (!hasToken) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="event-busy" size={64} color="#ccc" />
        <Text style={styles.title}>Connect Google Calendar</Text>
        <Text style={styles.subtitle}>
          Sign in with Google Calendar to view and select your calendars for
          class schedules.
        </Text>
        <Text style={styles.hint}>
          This screen will show your calendars once the Google Calendar
          connection (US-3.1) is complete.
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
        <Text style={styles.title}>
          {isEmpty ? "No Calendars" : "Could not load calendars"}
        </Text>
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
              style={[
                styles.calendarItem,
                isSelected && styles.calendarItemSelected,
              ]}
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
