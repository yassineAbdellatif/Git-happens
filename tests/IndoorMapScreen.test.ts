import * as fs from "fs";
import * as path from "path";

const screenPath = path.join(
  process.cwd(),
  "app/frontend/src/features/map/screens/IndoorMapScreen.tsx",
);

const readScreenSource = () => fs.readFileSync(screenPath, "utf8");

describe("IndoorMapScreen source contract", () => {
  it("uses route params to resolve floor plan entry", () => {
    const source = readScreenSource();

    expect(source).toContain(
      "getFloorPlanRegistryEntry(buildingId, activeFloor)"
    );
  });

  it("initializes indoor navigation with localized nodes fallback", () => {
    const source = readScreenSource();

    expect(source).toContain("useIndoorNavigation(");
    expect(source).toContain("buildingGraph?.nodes || []");
    expect(source).toContain("buildingGraph?.edges || []");
  });

  it("registers keyboard show and hide listeners", () => {
    const source = readScreenSource();

    expect(source).toContain('Keyboard.addListener("keyboardDidShow"');
    expect(source).toContain('Keyboard.addListener("keyboardDidHide"');
  });

  it("renders map-unavailable fallback message", () => {
    const source = readScreenSource();

    expect(source).toContain("Map not available for Floor");
  });
});
