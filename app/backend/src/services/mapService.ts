import axios from 'axios';
import { config } from '../config/config'; // Import the config to access the API key

export const getDirections = async (origin: string, destination: string, mode: string) => {
  
    // Use the key from config
  const apiKey = config.googleMapsApiKey;
  
  const googleMode = mode === 'SHUTTLE' ? 'transit' : mode.toLowerCase();

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=${googleMode}&key=${apiKey}`;
  
  const response = await axios.get(url);

  if (response.data.status === "OK" && response.data.routes.length > 0) {
    const route = response.data.routes[0];
    const leg = route.legs[0];

    const steps = leg.steps.map((step: any, index: number) => ({ //processing step by step directions
      stepNumber: index + 1,
      instruction: step.html_instructions.replace(/<[^>]*>/g, ""), //removes html tags
      distance: step.distance.text,
      duration: step.duration.text,
      maneuver: step.maneuver || "straight",
      startLocation: step.start_location,
      endLocation: step.end_location,
    }));

    return {
      ...response.data,
      processedRoute: {
        polyline: route.overview_polyline.points,
        bounds: route.bounds,
        totalDistance: leg.distance.text,
        totalDuration: leg.duration.text,
        steps: steps,
        startAddress: leg.start_address,
        endAddress: leg.end_address,
      },
    };
  }


  return response.data;
};