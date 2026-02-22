import { findNextClass } from "../app/frontend/src/utils/nextClassFinder";
import { CalendarEvent } from "../app/frontend/src/types/calendarTypes";

const makeEvent = (
  overrides: Partial<CalendarEvent> & { start: CalendarEvent["start"] }
): CalendarEvent => ({
  id: Math.random().toString(36).slice(2),
  summary: "SOEN 345 Lecture",
  status: "confirmed",
  end: { dateTime: "2026-03-01T12:00:00-05:00" },
  ...overrides,
});

const NOW = new Date("2026-03-01T08:00:00-05:00");

describe("nextClassFinder", () => {
  describe("findNextClass", () => {
    it("should return the earliest future event", () => {
      const events: CalendarEvent[] = [
        makeEvent({
          summary: "SOEN 345",
          location: "H-920",
          start: { dateTime: "2026-03-01T10:00:00-05:00" },
        }),
        makeEvent({
          summary: "COMP 346",
          location: "MB 3.270",
          start: { dateTime: "2026-03-01T09:00:00-05:00" },
        }),
      ];

      const result = findNextClass(events, NOW);
      expect(result).not.toBeNull();
      expect(result!.courseName).toBe("COMP 346");
      expect(result!.location).toEqual({ building: "MB", room: "3.270" });
    });

    it("should exclude past events", () => {
      const events: CalendarEvent[] = [
        makeEvent({
          summary: "Past Class",
          location: "H-100",
          start: { dateTime: "2026-03-01T07:00:00-05:00" },
        }),
        makeEvent({
          summary: "Future Class",
          location: "EV-1.605",
          start: { dateTime: "2026-03-01T14:00:00-05:00" },
        }),
      ];

      const result = findNextClass(events, NOW);
      expect(result!.courseName).toBe("Future Class");
    });

    it("should exclude cancelled events", () => {
      const events: CalendarEvent[] = [
        makeEvent({
          summary: "Cancelled",
          location: "H-920",
          status: "cancelled",
          start: { dateTime: "2026-03-01T09:00:00-05:00" },
        }),
        makeEvent({
          summary: "Active",
          location: "LB 125",
          start: { dateTime: "2026-03-01T11:00:00-05:00" },
        }),
      ];

      const result = findNextClass(events, NOW);
      expect(result!.courseName).toBe("Active");
    });

    it("should exclude all-day events (no dateTime, only date)", () => {
      const events: CalendarEvent[] = [
        makeEvent({
          summary: "All Day",
          start: { date: "2026-03-01" },
        }),
        makeEvent({
          summary: "Timed",
          location: "H 820",
          start: { dateTime: "2026-03-01T15:00:00-05:00" },
        }),
      ];

      const result = findNextClass(events, NOW);
      expect(result!.courseName).toBe("Timed");
    });

    it("should return null when all events are in the past", () => {
      const events: CalendarEvent[] = [
        makeEvent({
          start: { dateTime: "2026-03-01T06:00:00-05:00" },
        }),
        makeEvent({
          start: { dateTime: "2026-03-01T07:00:00-05:00" },
        }),
      ];

      expect(findNextClass(events, NOW)).toBeNull();
    });

    it("should return null for empty array", () => {
      expect(findNextClass([], NOW)).toBeNull();
    });

    it("should fallback to parsing summary when location is absent", () => {
      const events: CalendarEvent[] = [
        makeEvent({
          summary: "SOEN 345 - H-920",
          start: { dateTime: "2026-03-01T09:00:00-05:00" },
        }),
      ];

      const result = findNextClass(events, NOW);
      expect(result).not.toBeNull();
      expect(result!.location).toEqual({ building: "H", room: "920" });
    });

    it("should return null location when neither location nor summary is parseable", () => {
      const events: CalendarEvent[] = [
        makeEvent({
          summary: "Team Meeting",
          location: "Online",
          start: { dateTime: "2026-03-01T09:00:00-05:00" },
        }),
      ];

      const result = findNextClass(events, NOW);
      expect(result).not.toBeNull();
      expect(result!.location).toBeNull();
    });

    it("should work across multiple calendars (mixed input)", () => {
      const events: CalendarEvent[] = [
        makeEvent({
          summary: "Cal1 - Late",
          location: "H-100",
          start: { dateTime: "2026-03-01T16:00:00-05:00" },
        }),
        makeEvent({
          summary: "Cal2 - Early",
          location: "EV-1.605",
          start: { dateTime: "2026-03-01T09:30:00-05:00" },
        }),
        makeEvent({
          summary: "Cal1 - Cancelled",
          location: "MB 210",
          status: "cancelled",
          start: { dateTime: "2026-03-01T08:30:00-05:00" },
        }),
      ];

      const result = findNextClass(events, NOW);
      expect(result!.courseName).toBe("Cal2 - Early");
    });
  });
});
