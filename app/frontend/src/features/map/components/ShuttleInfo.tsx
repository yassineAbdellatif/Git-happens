import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { ShuttleSchedule } from "../../../types/shuttle";
import {
  getShuttleSchedule,
  formatMinutesUntilDeparture,
  formatDepartureTime,
} from "../../../services/shuttleApiService";

interface ShuttleInfoProps {
  routeId: string;
}

const ShuttleInfo: React.FC<ShuttleInfoProps> = ({ routeId }) => {
  const [schedule, setSchedule] = useState<ShuttleSchedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSchedule();
    // Refresh every 30 seconds
    const interval = setInterval(fetchSchedule, 30000);
    return () => clearInterval(interval);
  }, [routeId]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getShuttleSchedule(routeId);
      setSchedule(data);
    } catch (err) {
      setError("Unable to fetch shuttle info");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !schedule) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#912338" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!schedule) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Next Shuttle</Text>
        <Text style={styles.route}>{schedule.currentStop.name}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.timeSection}>
          <Text style={styles.departureLabel}>Departs</Text>
          <Text style={styles.departureTime}>
            {formatDepartureTime(schedule.nextDeparture)}
          </Text>
          <Text style={styles.minutesUntil}>
            {formatMinutesUntilDeparture(schedule.minutesUntilDeparture)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.destinationSection}>
          <Text style={styles.destinationLabel}>Destination</Text>
          <Text style={styles.destinationName}>
            {schedule.destination.name}
          </Text>
        </View>
      </View>

      <Text style={styles.refreshNote} onPress={fetchSchedule}>
        Tap to refresh
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff5f5",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#912338",
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  route: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 4,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeSection: {
    flex: 1,
    paddingRight: 12,
  },
  departureLabel: {
    fontSize: 11,
    color: "#999",
    marginBottom: 2,
  },
  departureTime: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#912338",
    marginBottom: 2,
  },
  minutesUntil: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: "#ddd",
    marginHorizontal: 8,
  },
  destinationSection: {
    flex: 1,
    paddingLeft: 12,
  },
  destinationLabel: {
    fontSize: 11,
    color: "#999",
    marginBottom: 2,
  },
  destinationName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  errorText: {
    fontSize: 12,
    color: "#d32f2f",
  },
  refreshNote: {
    fontSize: 10,
    color: "#999",
    marginTop: 6,
    fontStyle: "italic",
    textAlign: "center",
  },
});

export default ShuttleInfo;
