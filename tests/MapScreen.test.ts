import * as fs from "node:fs";
import * as path from "node:path";

const mapScreenPath = path.join(
  process.cwd(),
  "app/frontend/src/features/map/screens/MapScreen.tsx"
);

const readMapScreenSource = () => fs.readFileSync(mapScreenPath, "utf8");

describe("MapScreen source contract", () => {
  it("maps origin and destination fields from the new location-point state shape", () => {
    const source = readMapScreenSource();

    expect(source).toContain("const originType = origin.type;");
    expect(source).toContain("const originCoords = origin.coords;");
    expect(source).toContain("const originLabel = origin.label;");
    expect(source).toContain("const originCampus = origin.campus;");

    expect(source).toContain("const destinationType = destination.type;");
    expect(source).toContain("const destinationCoords = destination.coords;");
    expect(source).toContain("const destinationLabel = destination.label;");
    expect(source).toContain("const destinationCampus = destination.campus;");
  });

  it("uses map UI state hook keyed by selected building id", () => {
    const source = readMapScreenSource();

    expect(source).toContain("useMapScreenUiState(selectedBuilding?.id || null)");
    expect(source).toContain("const { mapType, setMapType, toggleMapType, isIndoorInteracting } =");
  });

  it("handles map-layer presses without full-screen touch blockers", () => {
    const source = readMapScreenSource();

    expect(source).toContain("const handleMapLayerPress = () => {");
    expect(source).toContain("Keyboard.dismiss();");
    expect(source).toContain("if (!isNavigating) {");
    expect(source).toContain("setSelectedBuilding(null);");
    expect(source).toContain("onMapPress={handleMapLayerPress}");
    expect(source).not.toContain("TouchableWithoutFeedback");
  });

  it("passes nearby POIs and map-type controls into OutdoorView", () => {
    const source = readMapScreenSource();

    expect(source).toContain("nearbyPois={nearbyPois}");
    expect(source).toContain("mapType={mapType}");
    expect(source).toContain("onMapTypeChange={setMapType}");
  });

  it("supports single-floor and multi-floor indoor navigation paths", () => {
    const source = readMapScreenSource();

    expect(source).toContain("const supportedFloors = getSupportedFloorsForBuilding(selectedBuilding.id);");
    expect(source).toContain("if (supportedFloors.length === 1) {");
    expect(source).toContain('navigation.navigate("IndoorMapScreen", {');
    expect(source).toContain("selectedFloorNumber: supportedFloors[0],");
    expect(source).toContain("} else if (supportedFloors.length > 1) {");
    expect(source).toContain('navigation.navigate("FloorSelectionScreen", {');
    expect(source).toContain("supportedFloors,");
  });

  it("shows indoor entry CTA only for buildings with supported floors", () => {
    const source = readMapScreenSource();

    expect(source).toContain("const hasSupportedFloors = selectedBuilding");
    expect(source).toContain("getSupportedFloorsForBuilding(selectedBuilding.id).length > 0");
    expect(source).toContain("{hasSupportedFloors && (");
    expect(source).toContain("onPress={handleOpenIndoorMap}");
    expect(source).toContain("Open Indoor Floor Plan");
  });

  it("wires drawer opening from the map header menu button", () => {
    const source = readMapScreenSource();

    expect(source).toContain(
      'import { useNavigation, useRoute, DrawerActions, RouteProp } from "@react-navigation/native";',
    );
    expect(source).toContain("navigation.dispatch(DrawerActions.openDrawer())");
    expect(source).toContain('name="menu"');
  });

  it("handles navigation params from schedule to auto-set destination", () => {
    const source = readMapScreenSource();

    expect(source).toContain("route.params?.destinationBuildingId");
    expect(source).toContain("setDestination({");
    expect(source).toContain("setIsRouting(true)");
    expect(source).toContain("MapStackParamList");
  });
});
