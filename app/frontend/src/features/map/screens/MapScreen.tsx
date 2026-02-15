import React from "react";
import {
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Text,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import { styles } from "../styles/mapScreenStyle";
import { SafeAreaProvider } from "react-native-safe-area-context";
import OutdoorView from "../components/OutDoorView";
import { SGW_REGION, CONCORDIA_BUILDINGS } from "../../../constants/buildings";
import { MaterialIcons } from "@expo/vector-icons";
import { useMapLogic } from "../hooks/useMapLogic"; // Path to your new hook

const MODE_ICON_MAP = {
  WALKING: "directions-walk",
  DRIVING: "directions-car",
  TRANSIT: "directions-bus",
  SHUTTLE: "airport-shuttle",
} as const;

const MapScreen = () => {
  const {
    // State & Refs
    mapRef,
    currentRegion,
    userLocation,
    currentBuilding,
    selectedBuilding,
    searchQuery,
    filteredBuildings,
    isRouting,
    transportMode,
    routeCoords,
    routeSteps,
    routeDistance,
    routeDuration,
    isNavigating,
    originType,
    originCoords,
    originLabel,
    nextShuttleTitle,
    nextShuttleSubtitle,
    destinationType,
    destinationCoords,
    destinationLabel,

    // Handlers
    handleRecenter,
    toggleCampus,
    handleBuildingPress,
    handleSearch,
    handleSelectFromSearch,
    handleCancelNavigation,
    handleFetchRoute,
    setIsRouting,
    setOriginType,
    setOriginLabel,
    setOriginCoords,
    setOriginCampus,
    setSelectedBuilding,
    setTransportMode,
    setDestinationType,
    setDestinationCoords,
    setDestinationLabel,
    setDestinationCampus,
  } = useMapLogic();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        {/* MAP LAYER */}
        <View style={styles.mapContainer}>
          <OutdoorView
            ref={mapRef}
            region={currentRegion}
            currentBuildingId={currentBuilding?.id}
            selectedBuildingId={selectedBuilding?.id}
            onBuildingPress={handleBuildingPress}
            // When navigating, we want to disable deselecting buildings by tapping the map, to prevent accidental taps from disrupting navigation. --- IGNORE ---
            onMapPress={
              isNavigating ? () => {} : () => setSelectedBuilding(null)
            }
            routeCoords={routeCoords}
            transportMode={transportMode}
          />
        </View>

        <SafeAreaProvider style={styles.overlay} pointerEvents="box-none">
          {/* TOP SEARCH BAR / ROUTE HEADER */}
          <View style={styles.searchContainer}>
            {!isRouting ? (
              !isNavigating && (
                <View style={styles.searchContainer}>
                  <View style={styles.searchBar}>
                    <TextInput
                      testID="search-input"
                      style={styles.searchInput}
                      placeholder="Search for a building or room..."
                      placeholderTextColor="#999"
                      value={searchQuery}
                      onChangeText={handleSearch}
                    />
                  </View>

                  {filteredBuildings.length > 0 && (
                    <View style={styles.dropdown}>
                      <ScrollView keyboardShouldPersistTaps="handled">
                        {filteredBuildings.map((b) => (
                          <TouchableOpacity
                            key={b.id}
                            testID={`search-result-${b.id}`}
                            style={styles.dropdownItem}
                            onPress={() => handleSelectFromSearch(b)}
                          >
                            <Text style={styles.dropdownText}>
                              {b.fullName}
                            </Text>
                            <Text style={styles.dropdownSubtext}>
                              {b.id} - {b.campus} Campus
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              )
            ) : (
              <View style={styles.routeHeader}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={
                    isNavigating
                      ? handleCancelNavigation
                      : () => setIsRouting(false)
                  }
                >
                  <MaterialIcons
                    name={isNavigating ? "arrow-back" : "close"}
                    size={24}
                    color="#333"
                  />
                </TouchableOpacity>

                <View style={styles.routeInputs}>
                  <View style={styles.inputRow}>
                    <MaterialIcons
                      name="my-location"
                      size={18}
                      color="#4285F4"
                    />
                    <Text style={styles.routeTextStatic}>
                      {originLabel || "Choose starting point"}
                    </Text>
                  </View>
                  <View style={styles.routeDivider} />
                  <View style={styles.inputRow}>
                    <MaterialIcons name="place" size={18} color="#912338" />
                    <Text style={styles.routeTextStatic}>
                      {destinationLabel || "Select destination"}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* RIGHT-SIDE CONTROLS */}
          {!isNavigating && (
            <View style={styles.rightControlsContainer}>
              <TouchableOpacity
                testID="recenter-button"
                style={styles.recenterButton}
                onPress={handleRecenter}
              >
                <MaterialIcons name="my-location" size={24} color="#912338" />
              </TouchableOpacity>

              <View style={styles.statusCard}>
                <Text style={styles.statusLabel}>CAMPUS</Text>
                <Text style={styles.statusValue}>
                  {currentBuilding
                    ? currentBuilding.campus
                    : currentRegion.latitude === SGW_REGION.latitude
                    ? "SGW"
                    : "LOYOLA"}
                </Text>
                <View style={styles.divider} />
                <Text style={styles.statusLabel}>BUILDING</Text>
                <Text style={styles.statusValue}>
                  {currentBuilding ? currentBuilding.id : "--"}
                </Text>
              </View>

              <TouchableOpacity
                testID="campus-toggle-button"
                style={styles.toggleButton}
                onPress={toggleCampus}
              >
                <Text style={styles.toggleText}>
                  {currentRegion.latitude === SGW_REGION.latitude
                    ? "TO LOYOLA"
                    : "TO SGW"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* BOTTOM SHEET */}
          {selectedBuilding && !isNavigating && (
            <View
              style={[
                styles.bottomSheetMock,
                isRouting && { minHeight: 220, height: "auto" },
              ]}
            >
              <View style={styles.dragHandle} />
              <ScrollView
                style={{ width: "100%" }}
                contentContainerStyle={{ alignItems: "center" }}
                showsVerticalScrollIndicator={false}
              >
                {!isRouting ? (
                  <>
                    <Text style={styles.sheetTitle}>
                      {selectedBuilding.fullName}
                    </Text>

                    {selectedBuilding.image && (
                      <Image
                        source={{ uri: selectedBuilding.image }}
                        style={styles.buildingImage}
                        resizeMode="cover"
                      />
                    )}

                    <Text style={styles.buildingInfo}>
                      {selectedBuilding.info}
                    </Text>

                    <TouchableOpacity
                      style={styles.directionsButton}
                      onPress={() => {
                        if (!selectedBuilding) return;

                        setOriginType("BUILDING");
                        setOriginCoords({ ...selectedBuilding.coordinates[0] });
                        setOriginLabel(selectedBuilding.fullName);
                        setOriginCampus(selectedBuilding.campus);

                        setDestinationType(null);
                        setDestinationCoords(null);
                        setDestinationLabel("Choose destination");

                        setIsRouting(true);
                      }}
                    >
                      <MaterialIcons
                        name="my-location"
                        size={20}
                        color="white"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.directionsButtonText}>
                        Start from here
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.directionsButton}
                      onPress={() => {
                        if (!selectedBuilding) return;

                        setDestinationType("BUILDING");
                        setDestinationCoords({
                          ...selectedBuilding.coordinates[0],
                        });
                        setDestinationLabel(selectedBuilding.fullName);
                        setDestinationCampus(selectedBuilding.campus);

                        setOriginType(null);
                        setOriginCoords(null);
                        setOriginLabel("Choose starting point");

                        setIsRouting(true);
                      }}
                    >
                      <MaterialIcons
                        name="place"
                        size={20}
                        color="white"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.directionsButtonText}>Go here</Text>
                    </TouchableOpacity>

                    <Text style={styles.sheetSubtitle}>
                      Tap a building to see indoor maps
                    </Text>
                  </>
                ) : (
                  <View style={{ width: "100%" }}>
                    {/* STEP 1: Picking Origin */}

                    {!originCoords ? (
                      originType === "BUILDING" ? (
                        <>
                          <Text style={styles.routingTitle}>
                            Select origin building
                          </Text>

                          <ScrollView style={{ maxHeight: 180 }}>
                            {CONCORDIA_BUILDINGS.map((b) => (
                              <TouchableOpacity
                                key={b.id}
                                style={styles.dropdownItem}
                                onPress={() => {
                                  setOriginCoords({ ...b.coordinates[0] });
                                  setOriginLabel(b.fullName);
                                  setOriginCampus(b.campus);
                                }}
                              >
                                <Text style={styles.dropdownText}>
                                  {b.fullName}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </>
                      ) : (
                        <>
                          <Text style={styles.routingTitle}>
                            Choose starting point
                          </Text>

                          <TouchableOpacity
                            style={styles.originOptionButton}
                            onPress={() => {
                              if (userLocation) {
                                setOriginType("CURRENT");
                                setOriginLabel("My Location");
                                setOriginCoords({
                                  latitude: userLocation.latitude,
                                  longitude: userLocation.longitude,
                                });
                              }
                            }}
                          >
                            <Text style={styles.originOptionText}>
                              Choose current location
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.originOptionButton}
                            onPress={() => setOriginType("BUILDING")}
                          >
                            <Text style={styles.originOptionText}>
                              Choose building
                            </Text>
                          </TouchableOpacity>
                        </>
                      )
                    ) : !destinationCoords ? (
                      /* STEP 2: Picking Destination */

                      destinationType === "BUILDING" ? (
                        <>
                          <Text style={styles.routingTitle}>
                            Select destination building
                          </Text>

                          <ScrollView style={{ maxHeight: 180 }}>
                            {CONCORDIA_BUILDINGS.map((b) => (
                              <TouchableOpacity
                                key={b.id}
                                style={styles.dropdownItem}
                                onPress={() => {
                                  setDestinationCoords({ ...b.coordinates[0] });
                                  setDestinationLabel(b.fullName);
                                  setDestinationCampus(b.campus);
                                }}
                              >
                                <Text style={styles.dropdownText}>
                                  {b.fullName}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </>
                      ) : (
                        <>
                          <Text style={styles.routingTitle}>
                            Choose destination
                          </Text>

                          <TouchableOpacity
                            style={styles.originOptionButton}
                            onPress={() => {
                              if (userLocation) {
                                setDestinationType("CURRENT");
                                setDestinationLabel("My Location");
                                setDestinationCoords({
                                  latitude: userLocation.latitude,
                                  longitude: userLocation.longitude,
                                });
                              }
                            }}
                          >
                            <Text style={styles.originOptionText}>
                              Choose current location
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.originOptionButton}
                            onPress={() => setDestinationType("BUILDING")}
                          >
                            <Text style={styles.originOptionText}>
                              Choose building
                            </Text>
                          </TouchableOpacity>
                        </>
                      )
                    ) : (
                      /* STEP 3: Travel Mode */

                      <>
                        <Text style={styles.routingTitle}>
                          Choose Travel Mode
                        </Text>

                        <View style={styles.modeContainer}>
                          {[
                            { id: "WALKING", icon: "directions-walk" },
                            { id: "DRIVING", icon: "directions-car" },
                            { id: "TRANSIT", icon: "directions-bus" },
                            { id: "SHUTTLE", icon: "airport-shuttle" },
                          ].map((mode) => (
                            <TouchableOpacity
                              key={mode.id}
                              style={[
                                styles.modeButton,
                                transportMode === mode.id &&
                                  styles.activeModeButton,
                              ]}
                              onPress={() => setTransportMode(mode.id)}
                            >
                              <MaterialIcons
                                name={mode.icon as any}
                                size={24}
                                color={
                                  transportMode === mode.id
                                    ? "white"
                                    : "#912338"
                                }
                              />
                            </TouchableOpacity>
                          ))}
                        </View>

                        <TouchableOpacity
                          style={styles.startButton}
                          onPress={() => handleFetchRoute(transportMode)}
                        >
                          <Text style={styles.startButtonText}>
                            Start Navigation
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                )}
              </ScrollView>
            </View>
          )}

          {/* STEP BY STEP DIRECTIONS */}
          {isNavigating && (
            <View style={styles.navigationSheet}>
              <View style={styles.dragHandle} />
              <View style={styles.routeSummary}>
                <View style={styles.summaryRow}>
                  <MaterialIcons
                    name={
                      (MODE_ICON_MAP[
                        transportMode as keyof typeof MODE_ICON_MAP
                      ] || "directions-walk") as any
                    }
                    size={24}
                    color="#912338"
                  />
                  <View style={styles.summaryInfo}>
                    <Text style={styles.durationText}>{routeDuration}</Text>
                    <Text style={styles.distanceText}>{routeDistance}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.endNavButton}
                  onPress={handleCancelNavigation}
                >
                  <Text style={styles.endNavText}>End</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.divider} />
              <Text style={styles.stepsHeader}>Steps</Text>
              <ScrollView style={styles.stepsContainer}>
                {routeSteps.map((step, index) => (
                  <View key={index} style={styles.stepItem}>
                    <MaterialIcons name="straight" size={20} color="#666" />
                    <View style={styles.stepTextContainer}>
                      <Text style={styles.stepInstruction}>
                        {step.instruction}
                      </Text>
                      <Text style={styles.stepDistance}>{step.distance}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </SafeAreaProvider>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default MapScreen;
