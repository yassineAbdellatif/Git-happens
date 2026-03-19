import * as fs from "fs";
import * as path from "path";

const mapLogicPath = path.join(
  process.cwd(),
  "app/frontend/src/features/map/hooks/useMapLogic.ts"
);

const outdoorViewPath = path.join(
  process.cwd(),
  "app/frontend/src/features/map/components/OutDoorView.tsx"
);

const mapScreenPath = path.join(
  process.cwd(),
  "app/frontend/src/features/map/screens/MapScreen.tsx"
);

const readFile = (filePath: string) => fs.readFileSync(filePath, "utf8");

describe("Nearby POI map feature", () => {
  it("fetches nearby POIs from Google using map center in useMapLogic", () => {
    const source = readFile(mapLogicPath);

    expect(source).toContain("getNearbyPlacesFromGoogle");
    expect(source).toContain('const POI_TYPES: NearbyPoiType[] = ["cafe", "restaurant", "library"]');
    expect(source).toContain("Promise.allSettled(requests)");
    expect(source).toContain("lat: region.latitude");
    expect(source).toContain("lng: region.longitude");
  });

  it("deduplicates and tags POIs by type in useMapLogic", () => {
    const source = readFile(mapLogicPath);

    expect(source).toContain("const mergedById = new Map<string, NearbyPoiMapItem>()");
    expect(source).toContain("if (!mergedById.has(poi.id))");
    expect(source).toContain("poiType: POI_TYPES[index]");
  });

  it("triggers POI refresh on region changes with debounce and movement threshold", () => {
    const source = readFile(mapLogicPath);

    expect(source).toContain("latDelta > 0.001 || lngDelta > 0.001");
    expect(source).toContain("clearTimeout(poiFetchTimeoutRef.current)");
    expect(source).toContain("setTimeout(() => {");
    expect(source).toContain("}, 700)");
  });

  it("renders nearby POI markers as small icon circles in OutDoorView", () => {
    const source = readFile(outdoorViewPath);

    expect(source).toContain("nearbyPois?.map((poi) => (");
    expect(source).toContain('key={`poi-${poi.id}`}');
    expect(source).toContain("style={styles.poiMarkerDot}");
    expect(source).toContain('poi.poiType === "library"');
    expect(source).toContain('poi.poiType === "restaurant"');
    expect(source).toContain('"local-cafe"');
  });

  it("uses plain overlay View in MapScreen instead of SafeAreaProvider", () => {
    const source = readFile(mapScreenPath);

    expect(source).not.toContain("SafeAreaProvider");
    expect(source).toContain('<View style={styles.overlay} pointerEvents="box-none">');
    expect(source).toContain("nearbyPois={nearbyPois}");
  });
});
