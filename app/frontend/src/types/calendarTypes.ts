export interface CalendarEvent {
  id: string;
  summary: string;
  location?: string;
  description?: string;
  status?: "confirmed" | "tentative" | "cancelled";
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
}

export interface ParsedLocation {
  building: string;
  room: string | null;
}

export interface NextClassInfo {
  event: CalendarEvent;
  location: ParsedLocation | null;
  startTime: Date;
  courseName: string;
}
