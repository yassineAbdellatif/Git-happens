import { Request, Response } from 'express';
import * as mapService from '../services/mapService';

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