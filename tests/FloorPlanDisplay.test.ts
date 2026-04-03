import * as fs from "fs";
import * as path from "path";

const floorPlanDisplayPath = path.join(
  process.cwd(),
  "app/frontend/src/features/map/components/FloorPlanDisplay.tsx"
);

const readSource = () => fs.readFileSync(floorPlanDisplayPath, "utf8");

describe("FloorPlanDisplay source contract", () => {
  it("maps building-floor keys to PNG assets", () => {
    const source = readSource();

    expect(source).toContain("const PNG_ASSET_MAP: Record<string, ImageSourcePropType> = {");
    expect(source).toContain("H_1:");
    expect(source).toContain("H_8:");
    expect(source).toContain("MB_S2:");
    expect(source).toContain("VE_2:");
    expect(source).toContain("VL_2:");
  });

  it("builds mapImageKey and resolves floor-plan image source", () => {
    const source = readSource();

    expect(source).toContain("const mapImageKey = `${floorPlanEntry.buildingId}_${floorPlanEntry.floorNumber}`;");
    expect(source).toContain("const MapImageSource = PNG_ASSET_MAP[mapImageKey];");
    expect(source).toContain("Image.resolveAssetSource(MapImageSource as number)");
  });

  it("renders fallback error text when mapping is missing", () => {
    const source = readSource();

    expect(source).toContain("Missing floor-plan asset mapping for: {mapImageKey}");
  });

  it("uses floor-plan interaction hook and zoom controls", () => {
    const source = readSource();

    expect(source).toContain("useIndoorFloorPlanInteraction(onInteractionChange)");
    expect(source).toContain("onPress={() => handleZoomChange(0.25)}");
    expect(source).toContain("onPress={() => handleZoomChange(-0.25)}");
    expect(source).toContain("onPress={handleResetView}");
    expect(source).toContain("{...panResponder.panHandlers}");
  });

  it("renders SvgImage overlays for POIs when icons are not embedded", () => {
    const source = readSource();

    expect(source).toContain("!floorPlanEntry.poiIconsEmbedded");
    expect(source).toContain(".filter((node) => node.nodeType in POI_ASSETS)");
    expect(source).toContain("<SvgImage");
    expect(source).toContain("href={{ uri: asset.uri }}");
    expect(source).toContain("onPoiPress?.(node);");
  });

  it("renders transparent Rect hit targets when icons are embedded", () => {
    const source = readSource();

    expect(source).toContain("floorPlanEntry.poiIconsEmbedded");
    expect(source).toContain("<Rect");
    expect(source).toContain('fill="rgba(252, 116, 116, 0.58)"');
    expect(source).toContain("onPoiPress?.(node);");
  });

  it("draws polyline and endpoint circles only when path has more than one node", () => {
    const source = readSource();

    expect(source).toContain("{path.length > 1 && (");
    expect(source).toContain("<Polyline");
    expect(source).toContain("points={polylinePoints}");
    expect(source).toContain("cx={path[0].x}");
    expect(source).toContain("cx={path.at(-1)!.x}");
    expect(source).toContain("const polylinePoints = useMemo(");
  });
});
