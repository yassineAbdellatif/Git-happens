import * as fs from "fs";
import * as path from "path";

const hookPath = path.join(
  process.cwd(),
  "app/frontend/src/features/map/hooks/useIndoorNavigation.ts",
);

const pathfindingPath = path.join(
  process.cwd(),
  "app/frontend/src/features/map/utils/pathfinding.ts",
);

const readSource = (filePath: string) => fs.readFileSync(filePath, "utf8");

describe("useIndoorNavigation source contract", () => {
  it("accepts nodes and edges and delegates routing to findPath", () => {
    const source = readSource(hookPath);

    expect(source).toContain(
      "useIndoorNavigation = (nodes: LocalizedNode[], edges: RawEdge[]) => {",
    );
    expect(source).toContain("const result = findPath(");
    expect(source).toContain("selectedStartNode.id");
    expect(source).toContain("selectedDestinationNode.id");
    expect(source).toContain("nodes,");
    expect(source).toContain("edges");
  });

  it("resets path on search and node selection updates", () => {
    const source = readSource(hookPath);

    expect(source).toContain("const handleStartSearch = (text: string) => {");
    expect(source).toContain(
      "const handleDestinationSearch = (text: string) => {",
    );
    expect(source).toContain(
      "const selectStartNode = (node: LocalizedNode) => {",
    );
    expect(source).toContain(
      "const selectDestinationNode = (node: LocalizedNode) => {",
    );
    expect(source).toContain("setPath([])");
  });

  it("warns when points are missing and logs navigation status", () => {
    const source = readSource(hookPath);

    expect(source).toContain('console.warn("Select both points first")');
    expect(source).toContain("console.log(");
    expect(source).toContain("[NAV] Path found: ${result.length} nodes");
    expect(source).toContain("[NAV] No path found between");
  });

  it("uses type-only imports to avoid heavy runtime graph data loading", () => {
    const source = readSource(hookPath);
    const pathfindingSource = readSource(pathfindingPath);

    expect(source).toContain("import type { LocalizedNode, RawEdge }");
    expect(pathfindingSource).toContain(
      "import type { LocalizedNode, RawEdge }",
    );
  });
});
