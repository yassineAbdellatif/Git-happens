import {
  classifyNextClass,
  apiErrorStatus,
  USER_MESSAGES,
} from "../app/frontend/src/utils/nextClassErrors";
import { NextClassInfo } from "../app/frontend/src/types/calendarTypes";

const makeInfo = (overrides: Partial<NextClassInfo> = {}): NextClassInfo => ({
  event: {
    id: "1",
    summary: "SOEN 345",
    start: { dateTime: "2026-03-01T10:00:00-05:00" },
    end: { dateTime: "2026-03-01T12:00:00-05:00" },
  },
  location: { building: "H", room: "920" },
  startTime: new Date("2026-03-01T10:00:00-05:00"),
  courseName: "SOEN 345",
  ...overrides,
});

describe("nextClassErrors", () => {
  describe("classifyNextClass", () => {
    it('should return "found" for a valid result with known building', () => {
      const result = classifyNextClass(makeInfo());
      expect(result.kind).toBe("found");
    });

    it('should return "no_upcoming" when result is null', () => {
      expect(classifyNextClass(null)).toEqual({ kind: "no_upcoming" });
    });

    it('should return "location_unavailable" when location is null', () => {
      const result = classifyNextClass(makeInfo({ location: null }));
      expect(result.kind).toBe("location_unavailable");
    });

    it('should return "building_unknown" when building ID does not match any known building', () => {
      const result = classifyNextClass(
        makeInfo({ location: { building: "ZZ", room: "100" } })
      );
      expect(result.kind).toBe("building_unknown");
    });

    it("should include the data payload on location_unavailable", () => {
      const info = makeInfo({ location: null });
      const result = classifyNextClass(info);
      expect(result.kind).toBe("location_unavailable");
      if (result.kind === "location_unavailable") {
        expect(result.data.courseName).toBe("SOEN 345");
      }
    });
  });

  describe("apiErrorStatus", () => {
    it("should extract message from Error instances", () => {
      const status = apiErrorStatus(new Error("Network timeout"));
      expect(status.kind).toBe("api_error");
      if (status.kind === "api_error") {
        expect(status.message).toBe("Network timeout");
      }
    });

    it("should handle non-Error thrown values", () => {
      const status = apiErrorStatus("something broke");
      expect(status.kind).toBe("api_error");
      if (status.kind === "api_error") {
        expect(status.message).toBe("Unknown error occurred");
      }
    });
  });

  describe("USER_MESSAGES", () => {
    it("should have a message for every non-found status", () => {
      expect(USER_MESSAGES.no_upcoming).toBeDefined();
      expect(USER_MESSAGES.location_unavailable).toBeDefined();
      expect(USER_MESSAGES.building_unknown).toBeDefined();
      expect(USER_MESSAGES.api_error).toBeDefined();
    });
  });
});
