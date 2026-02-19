import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { NextClassStatus, USER_MESSAGES } from "../../../utils/nextClassErrors";
import { CONCORDIA_BUILDINGS } from "../../../constants/buildings";
import { styles } from "../styles/nextClassCardStyle";

type Props = {
  status: NextClassStatus;
  loading: boolean;
  onDirections?: (buildingId: string) => void;
};

const formatTime = (date: Date): string => {
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  const min = m.toString().padStart(2, "0");
  return `${hour}:${min} ${ampm}`;
};

const minutesUntil = (date: Date): number =>
  Math.max(0, Math.round((date.getTime() - Date.now()) / 60_000));

const NextClassCard: React.FC<Props> = ({ status, loading, onDirections }) => {
  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="small" color="#912338" />
        <Text style={styles.loadingText}>Loading next class...</Text>
      </View>
    );
  }

  if (status.kind !== "found" && status.kind !== "location_unavailable" && status.kind !== "building_unknown") {
    const message = USER_MESSAGES[status.kind];
    return (
      <View style={styles.card}>
        <MaterialIcons name="event-busy" size={24} color="#999" />
        <Text style={styles.emptyText}>{message}</Text>
      </View>
    );
  }

  const { data } = status;
  const mins = minutesUntil(data.startTime);
  const building = data.location
    ? CONCORDIA_BUILDINGS.find((b) => b.id === data.location!.building)
    : null;

  const locationLabel = data.location
    ? `${data.location.building}${data.location.room ? ` ${data.location.room}` : ""}`
    : null;

  const showDirectionsButton =
    status.kind === "found" && data.location && building;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <MaterialIcons name="school" size={20} color="#912338" />
        <Text style={styles.headerLabel}>Upcoming Class</Text>
      </View>

      <Text style={styles.courseName} numberOfLines={1}>
        {data.courseName}
      </Text>

      <View style={styles.detailsRow}>
        <View style={styles.detail}>
          <MaterialIcons name="access-time" size={16} color="#666" />
          <Text style={styles.detailText}>
            {formatTime(data.startTime)} · in {mins} min
          </Text>
        </View>

        {locationLabel ? (
          <View style={styles.detail}>
            <MaterialIcons name="place" size={16} color="#666" />
            <Text style={styles.detailText}>{locationLabel}</Text>
          </View>
        ) : (
          <View style={styles.detail}>
            <MaterialIcons name="location-off" size={16} color="#999" />
            <Text style={styles.detailTextMuted}>
              {USER_MESSAGES[status.kind as keyof typeof USER_MESSAGES] ?? "Location not available"}
            </Text>
          </View>
        )}
      </View>

      {building && (
        <Text style={styles.campusBadge}>
          {building.campus} Campus
        </Text>
      )}

      {showDirectionsButton && (
        <TouchableOpacity
          testID="next-class-directions-button"
          style={styles.directionsButton}
          onPress={() => onDirections?.(data.location!.building)}
        >
          <MaterialIcons name="directions" size={18} color="white" />
          <Text style={styles.directionsText}>Get Directions</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default NextClassCard;
