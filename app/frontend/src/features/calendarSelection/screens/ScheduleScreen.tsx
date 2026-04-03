import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useCalendarSelection } from "../../../context/CalendarSelectionContext";
import { fetchUpcomingEvents } from "../../../services/calendarService";
import { CalendarEvent } from "../../../types/calendarTypes";
import { parseLocation } from "../../../utils/locationParser";
import { CONCORDIA_BUILDINGS } from "../../../constants/buildings";
import { useNextClass } from "../../nextClass/hooks/useNextClass";
import NextClassCard from "../../nextClass/components/NextClassCard";
import { styles } from "../styles/ScheduleStyle";

const HOURS = Array.from({ length: 14 }, (_, i) => i + 6); // 6am to 8pm
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const HOUR_HEIGHT = 60; // pixels per hour

const getMonday = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

interface PositionedEvent extends CalendarEvent {
  startHour: number;
  duration: number;
  dayIndex: number;
}

const ScheduleScreen: React.FC<{
  navigation?: any;
  onBackToSelection?: () => void;
}> = ({ navigation, onBackToSelection }) => {
  const { googleCalendarAccessToken, selectedCalendarIds } =
    useCalendarSelection();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );

const { status: nextClassStatus, loading: nextClassLoading } = useNextClass(
    googleCalendarAccessToken,
    selectedCalendarIds,
  );

  const loadEvents = async () => {
    if (!googleCalendarAccessToken || selectedCalendarIds.length === 0) {
      setError("No calendars selected or access token missing");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchedEvents = await fetchUpcomingEvents(
        googleCalendarAccessToken,
        selectedCalendarIds,
      );
      setEvents(fetchedEvents);
    } catch (err) {
      console.error("Failed to load events:", err);
      setError("Failed to load schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [googleCalendarAccessToken, selectedCalendarIds]);

  const getWeekDays = () => {
    return DAYS.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + index);
      return { day, date, index };
    });
  };

  const getPositionedEvents = (): PositionedEvent[] => {
    const weekStartDate = new Date(weekStart);
    weekStartDate.setHours(0, 0, 0, 0);

    return events
      .filter((event) => {
        if (!event.start.dateTime) return false;
        const eventDate = new Date(event.start.dateTime);
        const eventDateOnly = new Date(
          eventDate.getFullYear(),
          eventDate.getMonth(),
          eventDate.getDate(),
        );
        const weekStartOnly = new Date(
          weekStartDate.getFullYear(),
          weekStartDate.getMonth(),
          weekStartDate.getDate(),
        );
        const weekEndOnly = new Date(weekStartDate);
        weekEndOnly.setDate(weekEndOnly.getDate() + 4); // Mon-Fri = 5 days

        return eventDateOnly >= weekStartOnly && eventDateOnly <= weekEndOnly;
      })
      .map((event) => {
        const eventDate = new Date(event.start.dateTime!);
        const eventDateOnly = new Date(
          eventDate.getFullYear(),
          eventDate.getMonth(),
          eventDate.getDate(),
        );
        const weekStartOnly = new Date(
          weekStartDate.getFullYear(),
          weekStartDate.getMonth(),
          weekStartDate.getDate(),
        );

        // Calculate day index by comparing just the dates
        const daysDiff = Math.round(
          (eventDateOnly.getTime() - weekStartOnly.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        const dayIndex = Math.max(0, Math.min(daysDiff, 4));

        const startHour = eventDate.getHours() + eventDate.getMinutes() / 60;

        let duration = 1;
        if (event.end.dateTime) {
          const endDate = new Date(event.end.dateTime);
          duration =
            (endDate.getTime() - eventDate.getTime()) / (1000 * 60 * 60);
        }

        return {
          ...event,
          startHour: Math.max(6, Math.min(startHour, 20)),
          duration: Math.max(0.5, duration),
          dayIndex: dayIndex,
        };
      });
  };

  const handleRefresh = () => {
    loadEvents();
  };

  const handlePrevWeek = () => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() - 7);
    setWeekStart(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + 7);
    setWeekStart(newDate);
  };

  const handleBackToSelection = () => {
    if (onBackToSelection) {
      onBackToSelection();
    } else {
      navigation?.navigate("CalendarSelection");
    }
  };

  const closeEventDetails = () => {
    setSelectedEvent(null);
  };

  const handleGetDirections = () => {
    if (!selectedEvent?.location) {
      Alert.alert(
        "No Location",
        "This event does not have a location set.",
      );
      return;
    }

    const parsed = parseLocation(selectedEvent.location);
    if (!parsed) {
      Alert.alert(
        "Unknown Location",
        "Could not recognize a Concordia building from this event's location.",
      );
      return;
    }

    const building = CONCORDIA_BUILDINGS.find((b) => b.id === parsed.building);
    if (!building) {
      Alert.alert(
        "Building Not Found",
        `Building "${parsed.building}" was not found in the campus directory.`,
      );
      return;
    }

    closeEventDetails();
    navigateToBuilding(parsed.building, parsed.room ?? undefined);
  };

  const navigateToBuilding = (buildingId: string, room?: string) => {
    navigation?.navigate("CampusMap", {
      screen: "MapMain",
      params: {
        destinationBuildingId: buildingId,
        destinationRoom: room,
      },
    });
  };

  const handleNextClassDirections = (buildingId: string) => {
    navigateToBuilding(buildingId);
  };


  const getEventTimeRange = (event: CalendarEvent): string => {
    if (!event.start.dateTime) {
      return "All day";
    }

    const startTime = formatTime(event.start.dateTime);

    if (!event.end.dateTime) {
      return startTime;
    }

    return `${startTime} - ${formatTime(event.end.dateTime)}`;
  };

  const weekDays = getWeekDays();
  const positionedEvents = getPositionedEvents();
  const eventsBySlot = useMemo(() => {
    const groupedEvents: Record<string, PositionedEvent[]> = {};

    positionedEvents.forEach((event) => {
      const slotHour = Math.floor(event.startHour);
      const slotKey = `${event.dayIndex}-${slotHour}`;

      if (!groupedEvents[slotKey]) {
        groupedEvents[slotKey] = [];
      }

      groupedEvents[slotKey].push(event);
    });

    return groupedEvents;
  }, [positionedEvents]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#912338" />
        <Text style={styles.loadingText}>Loading your schedule...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="error-outline" size={64} color="#c62828" />
        <Text style={styles.title}>Unable to load schedule</Text>
        <Text style={styles.subtitle}>{error}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToSelection}
          >
            <Text style={styles.backButtonText}>Change Calendars</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButtonSmall}
          onPress={handleBackToSelection}
        >
          <MaterialIcons name="edit" size={24} color="#912338" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Weekly Schedule</Text>
          <Text style={styles.weekRangeText}>
            {weekStart.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            -{" "}
            {new Date(
              weekStart.getTime() + 4 * 24 * 60 * 60 * 1000,
            ).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <MaterialIcons name="refresh" size={24} color="#912338" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekNavigationContainer}>
        <TouchableOpacity style={styles.weekNavButton} onPress={handlePrevWeek}>
          <MaterialIcons name="chevron-left" size={24} color="#912338" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.weekNavButton}
          onPress={() => setWeekStart(getMonday(new Date()))}
        >
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.weekNavButton} onPress={handleNextWeek}>
          <MaterialIcons name="chevron-right" size={24} color="#912338" />
        </TouchableOpacity>
      </View>


      {/*
          // Small card that shows the next class and their location on the calendar screen
          // used while testing but not necessary in the issue so I commented it out for the time being
      <NextClassCard
          status={nextClassStatus}
          loading={nextClassLoading}
          onDirections={handleNextClassDirections}
      />
      */}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        scrollEventThrottle={16}
      >
        <View style={styles.calendarContainer}>
          {/* Day Headers */}
          <View style={styles.dayHeaderRow}>
            <View style={styles.timeColumnHeader} />
            {weekDays.map((dayObj, index) => (
              <View
                key={index}
                style={[
                  styles.dayColumn,
                  index === weekDays.length - 1 && { borderRightWidth: 0 },
                ]}
              >
                <Text style={styles.dayName}>{dayObj.day}</Text>
                <Text style={styles.dayDate}>{dayObj.date.getDate()}</Text>
              </View>
            ))}
          </View>

          {/* Time Slots */}
          {HOURS.map((hour) => (
            <View key={hour} style={styles.timeSlotRow}>
              <View style={styles.timeLabel}>
                <Text style={styles.timeLabelText}>
                  {hour > 12 ? hour - 12 : hour}
                  {hour >= 12 ? "pm" : "am"}
                </Text>
              </View>

              {weekDays.map((dayObj, dayIndex) => (
                <View
                  key={`${hour}-${dayObj.index}`}
                  pointerEvents="box-none"
                  style={[
                    styles.dayCell,
                    dayIndex === weekDays.length - 1 && { borderRightWidth: 0 },
                  ]}
                >
                  {/* Events for this hour */}
                  {(eventsBySlot[`${dayObj.index}-${hour}`] || []).map(
                    (event, idx) => {
                      // Calculate top offset in pixels (fractional hour * 60px)
                      const topOffsetPixels =
                        (event.startHour - Math.floor(event.startHour)) *
                        HOUR_HEIGHT;

                      // Calculate height in pixels based on duration (1 hour = 60px)
                      const heightPixels = event.duration * HOUR_HEIGHT;

                      return (
                        <TouchableOpacity
                          key={`${event.id}-${idx}`}
                          activeOpacity={0.85}
                          onPress={() => setSelectedEvent(event)}
                          style={[
                            styles.eventBlock,
                            {
                              height: heightPixels,
                              top: topOffsetPixels,
                            },
                          ]}
                        >
                          <Text
                            style={styles.eventBlockTitle}
                            numberOfLines={1}
                          >
                            {event.summary}
                          </Text>
                          {event.start.dateTime && (
                            <Text
                              style={styles.eventBlockTime}
                              numberOfLines={1}
                            >
                              {formatTime(event.start.dateTime)}
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    },
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={selectedEvent !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={closeEventDetails}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {selectedEvent?.summary || "Untitled Event"}
            </Text>

            <Text style={styles.modalTime}>
              {selectedEvent ? getEventTimeRange(selectedEvent) : ""}
            </Text>

            {selectedEvent?.location ? (
              <Text style={styles.modalDetailText}>
                Location: {selectedEvent.location}
              </Text>
            ) : null}

            {selectedEvent?.description ? (
              <Text style={styles.modalDetailText}>
                {selectedEvent.description}
              </Text>
            ) : null}

            <TouchableOpacity
              style={styles.modalDirectionsButton}
              onPress={handleGetDirections}
            >
              <View style={styles.modalDirectionsButtonContent}>
                <Text style={styles.modalDirectionsButtonText}>
                  Get Directions
                </Text>
                <Image
                  source={require("../../../../assets/get_directions.png")}
                  style={styles.modalDirectionsIcon}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={closeEventDetails}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ScheduleScreen;
