import { Request, Response } from "express";
import {
  getNextShuttleSchedule,
  getUpcomingShuttleDepartures,
  SHUTTLE_ROUTES,
} from "../services/shuttleService";

/**
 * Get the next shuttle schedule for a route
 * Query params: routeId
 */
export const getShuttleSchedule = async (req: Request, res: Response) => {
  try {
    const { routeId } = req.query;

    if (!routeId || typeof routeId !== "string") {
      return res
        .status(400)
        .json({ error: "routeId query parameter is required" });
    }

    const schedule = getNextShuttleSchedule(routeId);

    if (!schedule) {
      return res.status(404).json({ error: "Route not found" });
    }

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch shuttle schedule" });
  }
};

/**
 * Get all upcoming departures for a route
 * Query params: routeId, hoursAhead (optional, default 2)
 */
export const getShuttleDepartures = async (req: Request, res: Response) => {
  try {
    const { routeId, hoursAhead } = req.query;

    if (!routeId || typeof routeId !== "string") {
      return res
        .status(400)
        .json({ error: "routeId query parameter is required" });
    }

    const hours = hoursAhead ? parseInt(hoursAhead as string, 10) : 2;
    const departures = getUpcomingShuttleDepartures(routeId, new Date(), hours);

    res.json({ routeId, departures });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch shuttle departures" });
  }
};

/**
 * Get all available shuttle routes
 */
export const getShuttleRoutes = async (req: Request, res: Response) => {
  try {
    res.json({ routes: SHUTTLE_ROUTES });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch shuttle routes" });
  }
};
