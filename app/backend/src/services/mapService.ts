import axios from 'axios';
import { config } from '../config/config'; // Import the config to access the API key

export const getDirections = async (origin: string, destination: string, mode: string) => {
  
    // Use the key from config
  const apiKey = config.googleMapsApiKey;
  
  const googleMode = mode === 'SHUTTLE' ? 'transit' : mode.toLowerCase();

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=${googleMode}&key=${apiKey}`;
  
  const response = await axios.get(url);
  return response.data;
};