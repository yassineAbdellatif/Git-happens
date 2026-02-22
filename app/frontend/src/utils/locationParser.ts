import { CONCORDIA_BUILDINGS } from "../constants/buildings";
import { ParsedLocation } from "../types/calendarTypes";

const BUILDING_IDS = CONCORDIA_BUILDINGS.map((b) => b.id);

const FULL_NAME_TO_ID: Record<string, string> = {};
CONCORDIA_BUILDINGS.forEach((b) => {
  FULL_NAME_TO_ID[b.fullName.toLowerCase()] = b.id;
  FULL_NAME_TO_ID[b.name.toLowerCase()] = b.id;
});

/**
 * Patterns matched (order matters — most specific first):
 *
 *   "H-920"          → { building: "H",  room: "920" }
 *   "H 920"          → { building: "H",  room: "920" }
 *   "H920"           → { building: "H",  room: "920" }
 *   "MB 3.270"       → { building: "MB", room: "3.270" }
 *   "MB-S2.330"      → { building: "MB", room: "S2.330" }
 *   "EV-1.605"       → { building: "EV", room: "1.605" }
 *   "Hall Building Room 920" → { building: "H", room: "920" }
 *   "Hall Building"  → { building: "H",  room: null }
 *   "SGW Campus, H"  → { building: "H",  room: null }
 *   "Online"         → null
 */
export const parseLocation = (raw: string | undefined | null): ParsedLocation | null => {
  if (!raw || raw.trim().length === 0) return null;

  const cleaned = raw.trim();

  const idPatternResult = matchByBuildingId(cleaned);
  if (idPatternResult) return idPatternResult;

  const fullNameResult = matchByFullName(cleaned);
  if (fullNameResult) return fullNameResult;

  return null;
};

function matchByBuildingId(text: string): ParsedLocation | null {
  const sortedIds = [...BUILDING_IDS].sort((a, b) => b.length - a.length);

  for (const id of sortedIds) {
    const escaped = escapeRegex(id);

    // Pattern: ID[-_ ]?[RoomNumber]  e.g. "H-920", "MB 3.270", "EV1.605", "MB-S2.330"
    const withRoom = new RegExp(
      `(?:^|[\\s,;])${escaped}[\\s\\-_]?([A-Z]?\\d[\\d.]*\\d?)(?:\\s|$|,|;)`,
      "i"
    );
    const roomMatch = text.match(withRoom);
    if (roomMatch) {
      return { building: id, room: roomMatch[1] };
    }

    // Pattern: "Room XXX" appearing after the building ID
    const roomWord = new RegExp(
      `(?:^|[\\s,;])${escaped}[\\s,;]+(?:room|rm\\.?)\\s*(\\S+)`,
      "i"
    );
    const roomWordMatch = text.match(roomWord);
    if (roomWordMatch) {
      return { building: id, room: roomWordMatch[1] };
    }

    // Pattern: standalone building ID (word boundary)
    const standalone = new RegExp(`(?:^|[\\s,;])${escaped}(?:\\s|$|,|;)`, "i");
    if (standalone.test(text)) {
      return { building: id, room: null };
    }
  }

  return null;
}

function matchByFullName(text: string): ParsedLocation | null {
  const lower = text.toLowerCase();

  const sortedNames = Object.keys(FULL_NAME_TO_ID).sort(
    (a, b) => b.length - a.length
  );

  for (const name of sortedNames) {
    if (lower.includes(name)) {
      const buildingId = FULL_NAME_TO_ID[name];

      // Check if a room number follows: "Hall Building Room 920"
      const afterName = lower.slice(lower.indexOf(name) + name.length);
      const roomAfter = afterName.match(/\s*(?:room|rm\.?)\s*(\S+)/i);
      if (roomAfter) {
        return { building: buildingId, room: roomAfter[1] };
      }

      // Check for bare number after name: "Hall Building 920"
      const numAfter = afterName.match(/\s+(\d[\d.]*)/);
      if (numAfter) {
        return { building: buildingId, room: numAfter[1] };
      }

      return { building: buildingId, room: null };
    }
  }

  return null;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
