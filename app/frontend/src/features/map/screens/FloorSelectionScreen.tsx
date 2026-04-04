import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { NavigationProp, useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { IndoorBuildingId, FloorNumber } from "../../../services/floorPlanService"

type FloorSelectionRouteParams = {
  buildingId: IndoorBuildingId;
  buildingName: string;
  supportedFloors: FloorNumber[];
};

type RootStackParamList = {
  IndoorMapScreen: {
    buildingId: IndoorBuildingId;
    buildingName: string;
    selectedFloorNumber: FloorNumber;
  };
};

const FloorSelectionScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { buildingId, buildingName, supportedFloors } =
    route.params as FloorSelectionRouteParams;

  const handleSelectFloor = (floorNumber: FloorNumber) => {
    navigation.navigate("IndoorMapScreen", {
      buildingId,
      buildingName,
      selectedFloorNumber: floorNumber,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {buildingName}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Select a floor to view</Text>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {supportedFloors.length === 0 ? (
            <Text style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
              No floor plans available for this building yet.
            </Text>
          ) : (
            [...supportedFloors]
              .sort((a, b) => {
                // Force "S" (Sub-basement) floors to the top
                if (a.startsWith("S") && !b.startsWith("S")) return -1;
                if (!a.startsWith("S") && b.startsWith("S")) return 1;
                // Otherwise sort alphanumerically (1, 2, 8, 9)
                return a.localeCompare(b, undefined, { numeric: true });
              })
              .map((floor) => (
                <TouchableOpacity
                  key={floor}
                  testID={`floor-option-${floor}`}
                  style={styles.floorItem}
                  onPress={() => handleSelectFloor(floor)}
                >
                  <Text style={styles.floorText}>Floor {floor}</Text>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color="#912338"
                  />
                </TouchableOpacity>
              ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#912338",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#912338",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  content: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "600",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  floorItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 20,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  floorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
});

export default FloorSelectionScreen;
