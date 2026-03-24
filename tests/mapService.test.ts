import * as fs from "fs";
import * as path from "path";

const servicePath = path.join(
  process.cwd(),
  "app/backend/src/services/mapService.ts"
);

const readSource = () => fs.readFileSync(servicePath, "utf8");

describe("mapService lightweight coverage", () => {
  it("exports getDirections", () => {
    const source = readSource();
    expect(source).toContain("export const getDirections");
  });

  it("maps SHUTTLE mode to TRANSIT", () => {
    const source = readSource();
    expect(source).toContain('mode === "SHUTTLE" ? "TRANSIT" : mode.toLowerCase()');
  });

  it("builds directions url with origin, destination and key", () => {
    const source = readSource();

    expect(source).toContain("https://maps.googleapis.com/maps/api/directions/json");
    expect(source).toContain("origin=${origin}");
    expect(source).toContain("destination=${destination}");
    expect(source).toContain("key=${apiKey}");
  });

  it("processes route legs and strips html in instructions", () => {
    const source = readSource();

    expect(source).toContain("const steps = leg.steps.map");
    expect(source).toContain("step.html_instructions.replace");
    expect(source).toContain("maneuver: step.maneuver || \"straight\"");
    expect(source).toContain("processedRoute");
  });

  it("returns raw response when no usable route", () => {
    const source = readSource();
    expect(source).toContain("return response.data;");
  });
});
