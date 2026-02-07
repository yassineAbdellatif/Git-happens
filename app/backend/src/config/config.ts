import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
};

// Optional: Add a check to ensure the key exists
if (!config.googleMapsApiKey) {
  console.warn("WARNING: GOOGLE_MAPS_API_KEY is missing in .env file!");
}