import * as fs from "fs";
import * as path from "path";
import { getNearbyPlacesFromGoogle } from "../app/frontend/src/services/mapApiService";

const servicePath = path.join(
  process.cwd(),
  "app/frontend/src/services/mapApiService.ts"
);

const readSource = () => fs.readFileSync(servicePath, "utf8");

describe("mapApiService lightweight coverage", () => {
  it("keeps backend directions endpoint wired", () => {
    const source = readSource();

    expect(source).toContain("getRouteFromBackend");
    expect(source).toContain("`${API_BASE_URL}/api/directions`");
    expect(source).toContain("timeout: 10000");
  });

  it("uses Google nearbysearch endpoint and key", () => {
    const source = readSource();

    expect(source).toContain(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    );
    expect(source).toContain("getNearbyPlacesFromGoogle");
    expect(source).toContain("EXPO_PUBLIC_GOOGLE_MAPS_API_KEY");
  });

  it("maps nearby place fields into app shape", () => {
    const source = readSource();

    expect(source).toContain("id: place.place_id");
    expect(source).toContain("name: place.name");
    expect(source).toContain("address: place.vicinity || place.formatted_address || \"\"");
    expect(source).toContain("types: Array.isArray(place.types) ? place.types : []");
  });

  it("contains denied/failed status handling", () => {
    const source = readSource();

    expect(source).toContain('status === "REQUEST_DENIED"');
    expect(source).toContain('status !== "OK" && status !== "ZERO_RESULTS"');
    expect(source).toContain("Failed to fetch nearby places from Google");
  });

  it("throws when frontend Google key is missing", async () => {
    const previous = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY = "";

    await expect(
      getNearbyPlacesFromGoogle({ lat: 45.5, lng: -73.6, type: "cafe" })
    ).rejects.toThrow("EXPO_PUBLIC_GOOGLE_MAPS_API_KEY is missing");

    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY = previous;
  });
});
