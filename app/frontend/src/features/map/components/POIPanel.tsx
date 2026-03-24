import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { getDistance } from "geolib";
import { POIResult } from "../../../services/mapApiService";
import { POI_TYPES, MAX_RESULTS_OPTIONS, POIType } from "../hooks/usePOI";

interface POIPanelProps {
  selectedType: POIType | null;
  onSelectType: (t: POIType) => void;
  maxResults: number;
  onSelectMaxResults: (n: number) => void;
  results: POIResult[];
  isLoading: boolean;
  error: string | null;
  onSearch: () => void;
  onClose: () => void;
  userLocation: { latitude: number; longitude: number } | null;
  onSelectPOI: (poi: POIResult) => void;
}

const StarRating = ({ rating }: { rating: number | null }) => {
  if (rating === null) return <Text style={styles.ratingNone}>No rating</Text>;
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <View style={styles.starsRow}>
      {Array.from({ length: 5 }, (_, i) => {
        let name: "star" | "star-half" | "star-border" = "star-border";
        if (i < full) name = "star";
        else if (i === full && half) name = "star-half";
        return <MaterialIcons key={i} name={name} size={12} color="#F5A623" />;
      })}
      <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
    </View>
  );
};

export const POIPanel: React.FC<POIPanelProps> = ({
  selectedType,
  onSelectType,
  maxResults,
  onSelectMaxResults,
  results,
  isLoading,
  error,
  onSearch,
  onClose,
  userLocation,
  onSelectPOI,
}) => {
  const hasResults = results.length > 0;

  const resultsWithDistance = useMemo(() => {
    if (!userLocation) return results.map((r) => ({ ...r, distanceM: null }));
    return results.map((r) => ({
      ...r,
      distanceM: getDistance(
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        r.location,
      ),
    }));
  }, [results, userLocation]);

  return (
    <View style={styles.panel}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.dragHandle} />
        <View style={styles.headerRow}>
          <MaterialIcons name="place" size={20} color="#912338" />
          <Text style={styles.headerTitle}>Nearby Places</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <MaterialIcons name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Type chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {POI_TYPES.map((t) => {
          const active = selectedType?.key === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={[styles.chip, active && { backgroundColor: t.color, borderColor: t.color }]}
              onPress={() => onSelectType(t)}
              activeOpacity={0.75}
            >
              <MaterialIcons name={t.icon as any} size={16} color={active ? "#fff" : t.color} />
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Count selector + search button */}
      <View style={styles.controlsRow}>
        <Text style={styles.controlsLabel}>Show:</Text>
        {MAX_RESULTS_OPTIONS.map((n) => (
          <TouchableOpacity
            key={n}
            style={[styles.countBtn, maxResults === n && styles.countBtnActive]}
            onPress={() => onSelectMaxResults(n)}
          >
            <Text style={[styles.countBtnText, maxResults === n && styles.countBtnTextActive]}>
              {n}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.searchBtn, !selectedType && styles.searchBtnDisabled]}
          onPress={onSearch}
          disabled={!selectedType || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialIcons name="search" size={18} color="#fff" />
              <Text style={styles.searchBtnText}>Search</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Error message */}
      {error && !isLoading && (
        <View style={styles.errorBox}>
          <MaterialIcons name="warning" size={16} color="#E8472A" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Results list */}
      {hasResults && !isLoading && (
        <ScrollView style={styles.resultsList} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {resultsWithDistance.map((poi, idx) => (
            <TouchableOpacity
              key={poi.placeId}
              style={styles.resultCard}
              onPress={() => onSelectPOI(poi)}
              activeOpacity={0.8}
            >
              <View style={[styles.indexBubble, { backgroundColor: selectedType?.color ?? "#912338" }]}>
                <Text style={styles.indexText}>{idx + 1}</Text>
              </View>
              <View style={styles.resultInfo}>
                <Text style={styles.resultName} numberOfLines={1}>{poi.name}</Text>
                <Text style={styles.resultAddress} numberOfLines={1}>{poi.vicinity}</Text>
                <View style={styles.resultMeta}>
                  <StarRating rating={poi.rating} />
                  {poi.openNow !== null && (
                    <View style={[styles.openBadge, { backgroundColor: poi.openNow ? "#1A9B5F" : "#E8472A" }]}>
                      <Text style={styles.openBadgeText}>{poi.openNow ? "Open" : "Closed"}</Text>
                    </View>
                  )}
                </View>
              </View>
              {poi.distanceM !== null && (
                <Text style={styles.distanceText}>
                  {poi.distanceM < 1000 ? `${poi.distanceM} m` : `${(poi.distanceM / 1000).toFixed(1)} km`}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Empty state */}
      {!hasResults && !isLoading && !error && (
        <View style={styles.emptyState}>
          <MaterialIcons name="explore" size={40} color="#ccc" />
          <Text style={styles.emptyText}>Pick a category and tap Search to find nearby places.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "65%",
    elevation: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    zIndex: 20,
  },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4 },
  dragHandle: { width: 40, height: 4, backgroundColor: "#ddd", borderRadius: 2, alignSelf: "center", marginBottom: 10 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: "700", color: "#222" },
  closeBtn: { padding: 4 },
  chipsRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: "#ddd", backgroundColor: "#fafafa" },
  chipLabel: { fontSize: 13, fontWeight: "600", color: "#444" },
  chipLabelActive: { color: "#fff" },
  controlsRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  controlsLabel: { fontSize: 13, color: "#777", marginRight: 2 },
  countBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: "#ddd", justifyContent: "center", alignItems: "center", backgroundColor: "#fafafa" },
  countBtnActive: { backgroundColor: "#912338", borderColor: "#912338" },
  countBtnText: { fontSize: 13, fontWeight: "600", color: "#555" },
  countBtnTextActive: { color: "#fff" },
  searchBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, backgroundColor: "#912338", borderRadius: 20, paddingVertical: 10, marginLeft: 4 },
  searchBtnDisabled: { backgroundColor: "#ccc" },
  searchBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 6, marginHorizontal: 16, marginBottom: 10, padding: 10, backgroundColor: "#FFF0EE", borderRadius: 8, borderLeftWidth: 3, borderLeftColor: "#E8472A" },
  errorText: { fontSize: 13, color: "#E8472A", flex: 1 },
  resultsList: { paddingHorizontal: 16 },
  resultCard: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f0f0f0", gap: 10 },
  indexBubble: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  indexText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 14, fontWeight: "600", color: "#222" },
  resultAddress: { fontSize: 12, color: "#888", marginTop: 1 },
  resultMeta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 },
  starsRow: { flexDirection: "row", alignItems: "center", gap: 1 },
  ratingText: { fontSize: 11, color: "#888", marginLeft: 2 },
  ratingNone: { fontSize: 11, color: "#bbb" },
  openBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  openBadgeText: { fontSize: 10, color: "#fff", fontWeight: "600" },
  distanceText: { fontSize: 12, color: "#555", fontWeight: "600" },
  emptyState: { alignItems: "center", paddingVertical: 30, gap: 10 },
  emptyText: { fontSize: 13, color: "#aaa", textAlign: "center", paddingHorizontal: 30 },
});
