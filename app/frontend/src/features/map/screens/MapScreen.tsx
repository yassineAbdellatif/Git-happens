import React, { useEffect, useRef } from "react";
import { useNavigation, useRoute, DrawerActions, RouteProp } from "@react-navigation/native";
import { getSupportedFloorsForBuilding } from "@services/floorPlanService";
import { MapStackParamList } from "../../../navigation/AppNavigator";

import {
  View,
  TouchableOpacity,
  Keyboard,
  Text,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import { styles } from "../styles/mapScreenStyle";
import OutdoorView from "../components/OutDoorView";
import { POIPanel } from "../components/POIPanel";
import { usePOI } from "../hooks/usePOI";
import {
  SGW_REGION,
  LOYOLA_REGION,
  CONCORDIA_BUILDINGS,
  getDisplayStatus,
} from "../../../constants/buildings";
import { MaterialIcons } from "@expo/vector-icons";
import { useMapLogic } from "../hooks/useMapLogic"; // Path to your new hook
import { useMapScreenUiState } from "../hooks/useMapScreenUiState";

const MODE_ICON_MAP = {
  WALKING: "directions-walk",
  DRIVING: "directions-car",
  TRANSIT: "directions-bus",
  SHUTTLE: "airport-shuttle",
} as const;

const MapScreen = () => {
  const suppressMapPressUntilRef = useRef(0);
    const route = useRoute<RouteProp<MapStackParamList, "MapMain">>();
  const {
    // State & Refs
    mapRef,
    currentRegion,
    userLocation,
    currentBuilding,
    selectedBuilding,
    searchQuery,
    filteredBuildings,
    nearbyPois,
    isRouting,
    transportMode,
    routeCoords,
    routeSegments,
    routeSteps,
    routeDistance,
    routeDuration,
    isNavigating,
    origin,
    destination,
    nextShuttleTitle,
    nextShuttleSubtitle,

    // Handlers
    handleRecenter,
    toggleCampus,
    handleBuildingPress,
    handleRegionChangeComplete,
    handleSearch,
    handleSelectFromSearch,
    handleCancelNavigation,
    handleFetchRoute,
    setIsRouting,
    setOrigin,
    setSelectedBuilding,
    setTransportMode,
    setDestination,
    handleLogout,
  } = useMapLogic();
  const { mapType, setMapType, toggleMapType, isIndoorInteracting } =
    useMapScreenUiState(selectedBuilding?.id || null);

  const poi = usePOI();

  // Derive the old properties from origin/destination
  const originType = origin.type;
  const originCoords = origin.coords;
  const originLabel = origin.label;
  const originCampus = origin.campus;

  const destinationType = destination.type;
  const destinationCoords = destination.coords;
  const destinationLabel = destination.label;
  const destinationCampus = destination.campus;

  const statusText = getDisplayStatus(
    userLocation,
    currentRegion,
    selectedBuilding,
    currentBuilding,
  );

  const distanceToSgw =
    Math.abs(currentRegion.latitude - SGW_REGION.latitude) +
    Math.abs(currentRegion.longitude - SGW_REGION.longitude);
  const distanceToLoyola =
    Math.abs(currentRegion.latitude - LOYOLA_REGION.latitude) +
    Math.abs(currentRegion.longitude - LOYOLA_REGION.longitude);
  const isCloserToSgw = distanceToSgw <= distanceToLoyola;
  let campusLabel: string;
  if (currentBuilding) {
    campusLabel = currentBuilding.campus;
  } else if (isCloserToSgw) {
    campusLabel = "SGW";
  } else {
    campusLabel = "LOYOLA";
  }

  const handleMapLayerPress = () => {
    if (Date.now() < suppressMapPressUntilRef.current) {
      return;
    }

    Keyboard.dismiss();
    if (!isNavigating) {
      setSelectedBuilding(null);
    }
  };

  const navigation = useNavigation<any>();

  const handleOpenIndoorMap = () => {
    if (!selectedBuilding) return;

    const supportedFloors = getSupportedFloorsForBuilding(selectedBuilding.id);
    if (supportedFloors.length === 1) {
      // If only one floor, go straight to indoor map
      navigation.navigate("IndoorMapScreen", {
        buildingId: selectedBuilding.id,
        buildingName: selectedBuilding.fullName,
        selectedFloorNumber: supportedFloors[0],
      });
    } else if (supportedFloors.length > 1) {
      // If multiple floors, open floor selection
      navigation.navigate("FloorSelectionScreen", {
        buildingId: selectedBuilding.id,
        buildingName: selectedBuilding.fullName,
        supportedFloors,
      });
    }
  };

  const hasSupportedFloors = selectedBuilding
    ? getSupportedFloorsForBuilding(selectedBuilding.id).length > 0
    : false;

    // Handle navigation params from schedule "Get Directions" or "Go to Next Class"
      useEffect(() => {
        const destBuildingId = route.params?.destinationBuildingId;
        if (!destBuildingId) return;

        const building = CONCORDIA_BUILDINGS.find((b) => b.id === destBuildingId);
        if (!building) return;

        // Set destination to the target building
        setDestination({
          type: "BUILDING",
          coords: { ...building.coordinates[0] },
          label: building.fullName,
          campus: building.campus,
        });

        // Set origin to current location if available, otherwise let user pick
        if (userLocation) {
          setOrigin({
            type: "CURRENT",
            coords: {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            },
            label: "My Location",
            campus: null,
          });
        } else {
          setOrigin({
            type: null,
            coords: null,
            label: "Choose starting point",
            campus: null,
          });
        }

        setIsRouting(true);

        // Animate map to destination building
        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude: building.coordinates[0].latitude,
              longitude: building.coordinates[0].longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            },
            600,
          );
        }

        // Clear route params so re-visiting doesn't re-trigger
        navigation.setParams({
          destinationBuildingId: undefined,
          destinationRoom: undefined,
        } as any);
      }, [route.params?.destinationBuildingId]);

  return (
    <View style={styles.container}>
      {/* MAP LAYER */}
      <View style={styles.mapContainer}>
        <OutdoorView
          ref={mapRef}
          region={currentRegion}
          currentBuildingId={currentBuilding?.id}
          selectedBuildingId={selectedBuilding?.id}
          onBuildingPress={handleBuildingPress}
          onMapPress={handleMapLayerPress}
          onRegionChangeComplete={handleRegionChangeComplete}
          routeCoords={routeCoords}
          routeSegments={routeSegments}
          nearbyPois={nearbyPois}
          transportMode={transportMode}
          mapType={mapType}
          onMapTypeChange={setMapType}
        />
      </View>

      <View style={styles.overlay} pointerEvents="box-none">
        {/* TOP SEARCH BAR / ROUTE HEADER */}
        <View style={styles.searchContainer}>
          {isRouting ? (
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
                  <MaterialIcons name="my-location" size={18} color="#4285F4" />
                  <Text style={styles.routeTextStatic}>
                    {originLabel || "Choose starting point"}
                  </Text>
                </View>
                <View style={styles.routeDivider} />
                <View style={styles.inputRow}>
                  <MaterialIcons name="place" size={18} color="#912338" />
                  <Text style={styles.routeTextStatic}>
                    {destinationLabel || "Select Destination"}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            !isNavigating && (
              <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                  <TouchableOpacity
                    testID="drawer-menu-button"
                    style={styles.menuButton}
                    onPress={() =>
                      navigation.dispatch(DrawerActions.openDrawer())
                    }
                  >
                    <MaterialIcons name="menu" size={24} color="#ffffff" />
                  </TouchableOpacity>
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
                          onPress={() => {
                            // Search result taps can also trigger a map press; suppress it briefly.
                            suppressMapPressUntilRef.current = Date.now() + 1200;
                            handleSelectFromSearch(b);
                          }}
                        >
                          <Text style={styles.dropdownText}>{b.fullName}</Text>
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
          )}
        </View>

        {/* RIGHT-SIDE CONTROLS */}
        {!isNavigating && (
          <View style={styles.rightControlsContainer}>
            {/* Log out button */}
            <TouchableOpacity
              testID="logout-button"
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <MaterialIcons name="logout" size={24} color="#912338" />
            </TouchableOpacity>

            <TouchableOpacity
              testID="recenter-button"
              style={styles.recenterButton}
              onPress={handleRecenter}
            >
              <MaterialIcons name="my-location" size={24} color="#912338" />
            </TouchableOpacity>

            {/* Nearby POI button */}
            <TouchableOpacity
              testID="nearby-poi-button"
              style={[
                styles.nearbyPoiButton,
                poi.isOpen && styles.nearbyPoiButtonOpen,
              ]}
              onPress={() => {
                if (poi.isOpen) {
                  poi.setIsOpen(false);
                  poi.clearResults();
                } else {
                  poi.setIsOpen(true);
                }
              }}
            >
              <MaterialIcons name="explore" size={18} color="#fff" />
              <Text style={styles.nearbyPoiButtonText}>Nearby</Text>
            </TouchableOpacity>

            <View style={styles.statusCard}>
              <Text style={styles.statusLabel}>CAMPUS</Text>
              <Text style={styles.statusValue}>{campusLabel}</Text>
              <View style={styles.divider} />
              <Text style={styles.statusLabel}>BUILDING</Text>
              <Text style={styles.statusValue}>{statusText}</Text>
            </View>

            <TouchableOpacity
              testID="campus-toggle-button"
              style={styles.toggleButton}
              onPress={toggleCampus}
            >
              <Text style={styles.toggleText}>
                {isCloserToSgw ? "TO LOYOLA" : "TO SGW"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="map-type-toggle-button"
              style={styles.toggleButton}
              onPress={toggleMapType}
            >
              <Text style={styles.toggleText}>
                {mapType === "hybrid" ? "Map: Satellite" : "Map: Standard"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* POI PANEL */}
        {poi.isOpen && !isNavigating && (
          <POIPanel
            selectedType={poi.selectedType}
            onSelectType={poi.setSelectedType}
            maxResults={poi.maxResults}
            onSelectMaxResults={poi.setMaxResults}
            results={poi.results}
            isLoading={poi.isLoading}
            error={poi.error}
            onSearch={() => {
              const lat = userLocation?.latitude ?? currentRegion.latitude;
              const lng = userLocation?.longitude ?? currentRegion.longitude;
              poi.search(lat, lng);
            }}
            onClose={() => {
              poi.setIsOpen(false);
              poi.clearResults();
            }}
            userLocation={
              userLocation
                ? {
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                  }
                : null
            }
            onSelectPOI={(p) => {
              if (mapRef.current) {
                mapRef.current.animateToRegion(
                  {
                    ...p.location,
                    latitudeDelta: 0.003,
                    longitudeDelta: 0.003,
                  },
                  600,
                );
              }
            }}
            onGetDirections={(p) => {
              setDestination({
                type: "BUILDING",
                coords: {
                  latitude: p.location.latitude,
                  longitude: p.location.longitude,
                },
                label: p.name,
                campus: null,
              });
              if (userLocation) {
                setOrigin({
                  type: "CURRENT",
                  coords: {
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                  },
                  label: "My Location",
                  campus: null,
                });
              } else {
                setOrigin({
                  type: null,
                  coords: null,
                  label: "Choose starting point",
                  campus: null,
                });
              }
              poi.setIsOpen(false);
              poi.clearResults();
              setIsRouting(true);
            }}
          />
        )}

        {/* BOTTOM SHEET */}
        {(selectedBuilding || isRouting) && !isNavigating && (
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
              scrollEnabled={!isIndoorInteracting}
            >
              {selectedBuilding && !isRouting ? (
                <View style={{ width: "100%" }}>
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
                    testID="directions-button"
                    style={styles.directionsButton}
                    onPress={() => {
                      if (!selectedBuilding) return;

                      // Set origin to selected building
                      setOrigin({
                        type: "BUILDING",
                        coords: { ...selectedBuilding.coordinates[0] },
                        label: selectedBuilding.fullName,
                        campus: selectedBuilding.campus,
                      });

                      // Reset destination
                      setDestination({
                        type: null,
                        coords: null,
                        label: "Select Destination",
                        campus: null,
                      });

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

                      // Set destination to selected building
                      setDestination({
                        type: "BUILDING",
                        coords: { ...selectedBuilding.coordinates[0] },
                        label: selectedBuilding.fullName,
                        campus: selectedBuilding.campus,
                      });

                      // Reset origin
                      setOrigin({
                        type: null,
                        coords: null,
                        label: "Choose starting point",
                        campus: null,
                      });

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

                  {hasSupportedFloors && (
                    <TouchableOpacity
                      testID="open-indoor-floor-plan-button"
                      style={styles.indoorEntryButton}
                      onPress={handleOpenIndoorMap}
                    >
                      <MaterialIcons
                        name="map"
                        size={20}
                        color="white"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.indoorEntryButton}>
                        Open Indoor Floor Plan
                      </Text>
                    </TouchableOpacity>
                  )}

                  <Text style={styles.sheetSubtitle}>
                    Tap a building to see indoor maps
                  </Text>
                </View>
              ) : (
                <>
                  {/* STEP 1: Picking Origin - Building List */}
                  {originCoords === null && originType === "BUILDING" && (
                    <>
                      <Text style={styles.routingTitle}>
                        Select origin building
                      </Text>

                      <ScrollView style={{ maxHeight: 180 }}>
                        {CONCORDIA_BUILDINGS.filter(
                          (b) => b.fullName !== destinationLabel,
                        ).map((b) => (
                          <TouchableOpacity
                            key={b.id}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setOrigin({
                                type: "BUILDING",
                                coords: { ...b.coordinates[0] },
                                label: b.fullName,
                                campus: b.campus,
                              });
                            }}
                          >
                            <Text style={styles.dropdownText}>
                              {b.fullName}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </>
                  )}

                  {/* STEP 1: Picking Origin - Location Options */}
                  {originCoords === null && originType !== "BUILDING" && (
                    <>
                      <Text style={styles.routingTitle}>
                        Choose starting point
                      </Text>

                      <TouchableOpacity
                        style={[
                          styles.originOptionButton,
                          styles.primaryOptionButton,
                        ]}
                        onPress={() => {
                          if (userLocation) {
                            setOrigin({
                              type: "CURRENT",
                              coords: {
                                latitude: userLocation.latitude,
                                longitude: userLocation.longitude,
                              },
                              label: "My Location",
                              campus: null,
                            });
                          }
                        }}
                      >
                        <View
                          style={[
                            styles.optionIconBadge,
                            { backgroundColor: "rgba(66, 133, 244, 0.15)" },
                          ]}
                        >
                          <MaterialIcons
                            name="my-location"
                            size={22}
                            color="#4285F4"
                          />
                        </View>
                        <View style={styles.optionTextWrapper}>
                          <Text
                            style={[
                              styles.originOptionText,
                              { color: "#1f4b99", fontWeight: "700" },
                            ]}
                          >
                            Use current location
                          </Text>
                          <Text style={styles.optionSubtext}>
                            Start from where you are right now
                          </Text>
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.originOptionButton}
                        onPress={() =>
                          setOrigin((prev) => ({
                            ...prev,
                            type: "BUILDING",
                          }))
                        }
                      >
                        <View
                          style={[
                            styles.optionIconBadge,
                            { backgroundColor: "rgba(145, 35, 56, 0.1)" },
                          ]}
                        >
                          <MaterialIcons
                            name="domain"
                            size={22}
                            color="#912338"
                          />
                        </View>
                        <View style={styles.optionTextWrapper}>
                          <Text style={styles.originOptionText}>
                            Choose a building
                          </Text>
                          <Text style={styles.optionSubtext}>
                            Select from a list of campus buildings
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </>
                  )}

                  {/* STEP 2: Picking Destination - Building List */}
                  {originCoords !== null && destinationCoords === null && destinationType === "BUILDING" && (
                    <>
                      <Text style={styles.routingTitle}>
                        Select destination building
                      </Text>

                      <ScrollView style={{ maxHeight: 180 }}>
                        {CONCORDIA_BUILDINGS.filter(
                          (b) => b.fullName !== originLabel,
                        ).map((b) => (
                          <TouchableOpacity
                            key={b.id}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setDestination({
                                type: "BUILDING",
                                coords: { ...b.coordinates[0] },
                                label: b.fullName,
                                campus: b.campus,
                              });
                            }}
                          >
                            <Text style={styles.dropdownText}>
                              {b.fullName}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </>
                  )}

                  {/* STEP 2: Picking Destination - Location Options */}
                  {originCoords !== null && destinationCoords === null && destinationType !== "BUILDING" && (
                    <>
                      <Text style={styles.routingTitle}>
                        Select Destination
                      </Text>

                      <TouchableOpacity
                        style={[
                          styles.originOptionButton,
                          styles.primaryOptionButton,
                        ]}
                        onPress={() => {
                          if (userLocation) {
                            setDestination({
                              type: "CURRENT",
                              coords: {
                                latitude: userLocation.latitude,
                                longitude: userLocation.longitude,
                              },
                              label: "My Location",
                              campus: null,
                            });
                          }
                        }}
                      >
                        <View
                          style={[
                            styles.optionIconBadge,
                            { backgroundColor: "rgba(66, 133, 244, 0.15)" },
                          ]}
                        >
                          <MaterialIcons
                            name="my-location"
                            size={22}
                            color="#4285F4"
                          />
                        </View>
                        <View style={styles.optionTextWrapper}>
                          <Text
                            style={[
                              styles.originOptionText,
                              { color: "#1f4b99", fontWeight: "700" },
                            ]}
                          >
                            Use current location
                          </Text>
                          <Text style={styles.optionSubtext}>
                            Start from where you are right now
                          </Text>
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.originOptionButton}
                        onPress={() =>
                          setDestination((prev) => ({
                            ...prev,
                            type: "BUILDING",
                          }))
                        }
                      >
                        <View
                          style={[
                            styles.optionIconBadge,
                            { backgroundColor: "rgba(145, 35, 56, 0.1)" },
                          ]}
                        >
                          <MaterialIcons
                            name="domain"
                            size={22}
                            color="#912338"
                          />
                        </View>
                        <View style={styles.optionTextWrapper}>
                          <Text style={styles.originOptionText}>
                            Choose a building
                          </Text>
                          <Text style={styles.optionSubtext}>
                            Select from a list of campus buildings
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </>
                  )}

                  {/* STEP 3: Travel Mode */}
                  {originCoords !== null && destinationCoords !== null && (
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
                            testID={`travel-mode-${mode.id.toLowerCase()}`}
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
                                transportMode === mode.id ? "white" : "#912338"
                              }
                            />
                          </TouchableOpacity>
                        ))}
                      </View>

                      {transportMode === "SHUTTLE" &&
                        nextShuttleTitle.length > 0 && (
                          <View style={styles.shuttleInfo}>
                            <Text style={styles.shuttleText}>
                              {nextShuttleTitle}
                            </Text>
                            {nextShuttleSubtitle.length > 0 && (
                              <Text style={styles.shuttleSubtext}>
                                {nextShuttleSubtitle}
                              </Text>
                            )}
                          </View>
                        )}

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
                </>
              )}
            </ScrollView>
          </View>
        )}

        {/* STEP BY STEP DIRECTIONS */}
        {isNavigating && (
          <View style={styles.navigationSheet}>
            <View style={styles.dragHandle} />

            {/* NEW: Transport Mode Selector during active navigation */}
            <View style={styles.modeContainer}>
              {[
                { id: "WALKING", icon: "directions-walk" },
                { id: "DRIVING", icon: "directions-car" },
                { id: "TRANSIT", icon: "directions-bus" },
                { id: "SHUTTLE", icon: "airport-shuttle" },
              ].map((mode) => (
                <TouchableOpacity
                  key={`nav-mode-${mode.id}`}
                  style={[
                    styles.modeButton,
                    transportMode === mode.id && styles.activeModeButton,
                  ]}
                  onPress={() => {
                    // Only fetch if they actually select a different mode
                    if (transportMode !== mode.id) {
                      setTransportMode(mode.id);
                      handleFetchRoute(mode.id);
                    }
                  }}
                >
                  <MaterialIcons
                    name={mode.icon as any}
                    size={24}
                    color={transportMode === mode.id ? "white" : "#912338"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* NEW: Display Shuttle info if they switch to shuttle mode mid-navigation */}
            {transportMode === "SHUTTLE" && nextShuttleTitle.length > 0 && (
              <View style={styles.shuttleInfo}>
                <Text style={styles.shuttleText}>{nextShuttleTitle}</Text>
                {nextShuttleSubtitle.length > 0 && (
                  <Text style={styles.shuttleSubtext}>
                    {nextShuttleSubtitle}
                  </Text>
                )}
              </View>
            )}

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
                <View key={`step-${step.instruction}-${index}`} style={styles.stepItem}>
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
      </View>
    </View>
  );
};

export default MapScreen;
