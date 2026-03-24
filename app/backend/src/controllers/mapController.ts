import { Request, Response } from 'express';
import * as mapService from '../services/mapService';

export const getNearbyPlaces = async (req: Request, res: Response) => {
  try {
    const { location, type } = req.query;
    console.log("getNearbyPlaces called with:", { location, type, radius: req.query.radius, maxResults: req.query.maxResults });
    if (!location || !type) {
      res.status(400).json({ error: "location and type are required" });
      return;
    }
    const radius = Number.parseInt((req.query.radius as string) ?? "1500", 10);
    const maxResults = Number.parseInt((req.query.maxResults as string) ?? "10", 10);
    const results = await mapService.getNearbyPlaces(
      location as string,
      radius,
      type as string,
      maxResults,
    );
    res.json({ results });
  } catch (error) {
    console.error("getNearbyPlaces error:", error);
    res.status(500).json({ error: "Failed to fetch nearby places" });
  }
};

export const getRoute = async (req: Request, res: Response) => {
  try {
    const { origin, destination, mode } = req.query;
    const directions = await mapService.getDirections(
      origin as string, 
      destination as string, 
      mode as string
    );
    res.json(directions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch directions" });
  }
};