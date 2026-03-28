import * as fs from "fs";
import * as path from "path";

const outdoorViewPath = path.join(
  process.cwd(),
  "app/frontend/src/features/map/components/OutDoorView.tsx"
);

const poiPanelPath = path.join(
  process.cwd(),
  "app/frontend/src/features/map/components/POIPanel.tsx"
);

const usePoiPath = path.join(
  process.cwd(),
  "app/frontend/src/features/map/hooks/usePOI.ts"
);

const readFile = (filePath: string) => fs.readFileSync(filePath, "utf8");

describe("POI UI and hooks source contract", () => {
  describe("OutDoorView", () => {
    it("maps transport modes to explicit route colors", () => {
      const source = readFile(outdoorViewPath);

      expect(source).toContain("const currentColor = useMemo(() => {");
      expect(source).toContain('case "DRIVING":');
      expect(source).toContain('case "WALKING":');
      expect(source).toContain('case "TRANSIT":');
      expect(source).toContain('case "SHUTTLE":');
      expect(source).toContain('return "#4285F4"');
      expect(source).toContain('return "#020202"');
      expect(source).toContain('return "#912338"');
    });

    it("renders segmented polylines first and falls back to routeCoords", () => {
      const source = readFile(outdoorViewPath);

      expect(source).toContain("routeSegments && routeSegments.length > 0");
      expect(source).toContain("routeSegments.map((segment, index) => (");
      expect(source).toContain("strokeColor={getSegmentColor(segment.mode)}");
      expect(source).toContain('segment.mode?.toUpperCase() === "WALKING" ? [2, 10] : [0]');
      expect(source).toContain("routeCoords &&");
      expect(source).toContain("routeCoords.length > 0 && (");
      expect(source).toContain("strokeColor={currentColor}");
      expect(source).toContain('lineDashPattern={transportMode === "WALKING" ? [2, 10] : [0]}');
    });

    it("applies selected and current building highlight styles", () => {
      const source = readFile(outdoorViewPath);

      expect(source).toContain("const isSelected = building.id === selectedBuildingId;");
      expect(source).toContain("const isCurrent = building.id === currentBuildingId;");
      expect(source).toContain("if (isSelected) {");
      expect(source).toContain('fillColor = "rgba(145, 35, 56, 0.8)"');
      expect(source).toContain('strokeColor = "#111111"');
      expect(source).toContain("} else if (isCurrent) {");
      expect(source).toContain('fillColor = "rgba(255, 215, 0, 0.6)"');
      expect(source).toContain('strokeColor = "#7a5d00"');
    });
  });

  describe("POIPanel", () => {
    it("computes distance values only when user location is available", () => {
      const source = readFile(poiPanelPath);

      expect(source).toContain("const resultsWithDistance = useMemo(() => {");
      expect(source).toContain("if (!userLocation) return results.map((r) => ({ ...r, distanceM: null }));");
      expect(source).toContain("distanceM: getDistance(");
      expect(source).toContain("[results, userLocation]");
    });

    it("uses POI type and max-results selectors from usePOI constants", () => {
      const source = readFile(poiPanelPath);

      expect(source).toContain("import { POI_TYPES, MAX_RESULTS_OPTIONS, POIType } from \"../hooks/usePOI\"");
      expect(source).toContain("{POI_TYPES.map((t) => {");
      expect(source).toContain("const active = selectedType?.key === t.key;");
      expect(source).toContain("onPress={() => onSelectType(t)}");
      expect(source).toContain("{MAX_RESULTS_OPTIONS.map((n) => (");
      expect(source).toContain("onPress={() => onSelectMaxResults(n)}");
    });

    it("renders loading and error UI states for POI searches", () => {
      const source = readFile(poiPanelPath);

      expect(source).toContain("<ActivityIndicator size=\"small\" color=\"#fff\" />");
      expect(source).toContain("{error && !isLoading && (");
      expect(source).toContain("<Text style={styles.errorText}>{error}</Text>");
    });
  });

  describe("usePOI", () => {
    it("guards search when no POI type is selected", () => {
      const source = readFile(usePoiPath);

      expect(source).toContain("if (!selectedType) return;");
      expect(source).toContain("setIsLoading(true)");
      expect(source).toContain("setError(null)");
    });

    it("handles empty result and request error branches", () => {
      const source = readFile(usePoiPath);

      expect(source).toContain("const places = await getNearbyPlaces(latitude, longitude, selectedType.key, maxResults);");
      expect(source).toContain("if (places.length === 0) {");
      expect(source).toContain("No places found nearby. Try a different type or increase the count.");
      expect(source).toContain("setError(\"Could not load nearby places. Check your connection.\")");
      expect(source).toContain("setResults([])");
      expect(source).toContain("setIsLoading(false)");
    });

    it("clears type, results, and error in clearResults", () => {
      const source = readFile(usePoiPath);

      expect(source).toContain("const clearResults = useCallback(() => {");
      expect(source).toContain("setResults([])");
      expect(source).toContain("setError(null)");
      expect(source).toContain("setSelectedType(null)");
    });
  });
});
