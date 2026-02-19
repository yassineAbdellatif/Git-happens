import { parseLocation } from "../app/frontend/src/utils/locationParser";

describe("locationParser", () => {
  describe("parseLocation", () => {
    // --- Building ID with room patterns ---

    it('should parse "H-920" as building H, room 920', () => {
      expect(parseLocation("H-920")).toEqual({ building: "H", room: "920" });
    });

    it('should parse "H 920" as building H, room 920', () => {
      expect(parseLocation("H 920")).toEqual({ building: "H", room: "920" });
    });

    it('should parse "MB 3.270" as building MB, room 3.270', () => {
      expect(parseLocation("MB 3.270")).toEqual({
        building: "MB",
        room: "3.270",
      });
    });

    it('should parse "MB-S2.330" as building MB, room S2.330', () => {
      expect(parseLocation("MB-S2.330")).toEqual({
        building: "MB",
        room: "S2.330",
      });
    });

    it('should parse "EV-1.605" as building EV, room 1.605', () => {
      expect(parseLocation("EV-1.605")).toEqual({
        building: "EV",
        room: "1.605",
      });
    });

    it('should parse "LB 125" correctly', () => {
      expect(parseLocation("LB 125")).toEqual({
        building: "LB",
        room: "125",
      });
    });

    // --- Full name patterns ---

    it('should parse "Henry F. Hall Building Room 920"', () => {
      const result = parseLocation("Henry F. Hall Building Room 920");
      expect(result).toEqual({ building: "H", room: "920" });
    });

    it('should parse "Hall Building" as building H with no room', () => {
      const result = parseLocation("Hall Building");
      expect(result).not.toBeNull();
      expect(result!.building).toBe("H");
    });

    it('should parse "John Molson Building Room 210"', () => {
      const result = parseLocation("John Molson Building Room 210");
      expect(result).toEqual({ building: "MB", room: "210" });
    });

    it('should parse "Vanier Library Building"', () => {
      const result = parseLocation("Vanier Library Building");
      expect(result).not.toBeNull();
      expect(result!.building).toBe("VL");
    });

    // --- Embedded in longer strings ---

    it("should find building code inside a longer location string", () => {
      const result = parseLocation("SGW Campus, H-820");
      expect(result).toEqual({ building: "H", room: "820" });
    });

    it("should find building in comma-separated string", () => {
      const result = parseLocation("Concordia University, MB 1.210, Montreal");
      expect(result).toEqual({ building: "MB", room: "1.210" });
    });

    // --- Standalone building code ---

    it("should match a standalone building code with no room", () => {
      const result = parseLocation("GM");
      expect(result).toEqual({ building: "GM", room: null });
    });

    // --- Null / empty / garbage ---

    it("should return null for null input", () => {
      expect(parseLocation(null)).toBeNull();
    });

    it("should return null for undefined input", () => {
      expect(parseLocation(undefined)).toBeNull();
    });

    it("should return null for empty string", () => {
      expect(parseLocation("")).toBeNull();
    });

    it("should return null for whitespace-only string", () => {
      expect(parseLocation("   ")).toBeNull();
    });

    it('should return null for "Online"', () => {
      expect(parseLocation("Online")).toBeNull();
    });

    it('should return null for "TBD"', () => {
      expect(parseLocation("TBD")).toBeNull();
    });

    it("should return null for unrelated address", () => {
      expect(parseLocation("123 Main Street, Montreal")).toBeNull();
    });

    // --- Case insensitivity for full names ---

    it("should be case-insensitive for full building names", () => {
      const result = parseLocation("henry f. hall building room 820");
      expect(result).toEqual({ building: "H", room: "820" });
    });
  });
});
