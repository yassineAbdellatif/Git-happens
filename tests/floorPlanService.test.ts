import * as fs from "node:fs";
import * as path from "node:path";

const floorPlanServicePath = path.join(
  process.cwd(),
  "app/frontend/src/services/floorPlanService.ts"
);

const readSource = () => fs.readFileSync(floorPlanServicePath, "utf8");

describe("floorPlanService source contract", () => {
  it("loads indoor floor JSON datasets", () => {
    const source = readSource();

    expect(source).toContain('import hData from "../../assets/indoor_floor_plans/hall.json";');
    expect(source).toContain('import ccData from "../../assets/indoor_floor_plans/cc1.json";');
    expect(source).toContain('import mbData from "../../assets/indoor_floor_plans/mb_floors_combined.json";');
    expect(source).toContain('import veData from "../../assets/indoor_floor_plans/ve.json";');
    expect(source).toContain('import vlData from "../../assets/indoor_floor_plans/vl_floors_combined.json";');
  });

  it("defines supported indoor buildings and type guard", () => {
    const source = readSource();

    expect(source).toContain("const SUPPORTED_INDOOR_BUILDINGS = new Set<string>([");
    expect(source).toContain('"H"');
    expect(source).toContain('"CC"');
    expect(source).toContain('"MB"');
    expect(source).toContain('"VE"');
    expect(source).toContain('"VL"');
    expect(source).toContain("const isSupportedIndoorBuildingId = (");
    expect(source).toContain("SUPPORTED_INDOOR_BUILDINGS.has(buildingId)");
  });

  it("returns building-specific supported floor lists", () => {
    const source = readSource();

    expect(source).toContain("export const getSupportedFloorsForBuilding = (");
    expect(source).toContain('case "H":');
    expect(source).toContain('return ["1", "2", "8", "9"];');
    expect(source).toContain('case "MB":');
    expect(source).toContain('return ["1", "S2"];');
    expect(source).toContain('case "CC":');
    expect(source).toContain('return ["1"];');
    expect(source).toContain('case "VE":');
    expect(source).toContain('return ["1", "2"];');
    expect(source).toContain('case "VL":');
    expect(source).toContain('return ["1", "2"];');
    expect(source).toContain("default:");
    expect(source).toContain("return [];");
  });

  it("handles Hall-building naming mismatch when filtering raw nodes", () => {
    const source = readSource();

    expect(source).toContain("function matchesBuildingId(");
    expect(source).toContain('buildingId === "H" ? nb === "Hall" : nb === buildingId');
  });

  it("normalizes node types and washroom detection during localization", () => {
    const source = readSource();

    expect(source).toContain("function resolveNodeType(");
    expect(source).toContain('if (type === "elevator_door") return "elevator";');
    expect(source).toContain('if (type === "room" && nodeId.toLowerCase().includes("washroom"))');
    expect(source).toContain('return "washroom";');
    expect(source).toContain("label: node.label || node.id,");
  });

  it("returns null and logs warning when no floor nodes are found", () => {
    const source = readSource();

    expect(source).toContain("if (rawNodesForFloor.length === 0) {");
    expect(source).toContain("console.warn(`No JSON nodes found for ${buildingId} Floor ${floorNumber}`);");
    expect(source).toContain("return null;");
  });

  it("scopes edges to selected floor nodes and toggles embedded POI icon floors", () => {
    const source = readSource();

    expect(source).toContain("const nodeIdSet = new Set(rawNodesForFloor.map((n) => n.id));");
    expect(source).toContain("const edges = filterEdgesForNodes(ALL_RAW_EDGES, nodeIdSet);");
    expect(source).toContain('const EMBEDDED_ICON_FLOORS = new Set(["H_8", "H_9", "VE_2"]);');
    expect(source).toContain("const poiIconsEmbedded = EMBEDDED_ICON_FLOORS.has(");
    expect(source).toContain("`${buildingId}_${floorNumber}`");
  });
});
