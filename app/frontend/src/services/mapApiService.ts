import axios from 'axios';

// TIP: Use your actual IP address here. 
// On Mac: Option + Click Wi-Fi icon -> IP Address
// On Windows: Type 'ipconfig' in cmd -> IPv4 Address
const API_BASE_URL = 'http://localhost:3000/'; // Update with your backend server address

export const getRouteFromBackend = async (origin: string, destination: string, mode: string) => {

    // UNCOMMENT THIS TO TEST FOR FREE:
/** 
  console.log("MOCK MODE: Returning fake route");
  return {
    routes: [{
      overview_polyline: { 
        // This is a fake encoded string 
        points: "u~ttGba_`L_AtC@u@NcBRmBJmBJiBL_BH_BDeBDeBBeB@eB@cA?cA?aA?aAAcACcAEcAGcAIcAKcAM"
      }
    }]
  };
  */
  const url = `${API_BASE_URL}api/directions`;
  console.log(`Requesting route from backend at: ${url}`);

  try {
    const response = await axios.get(url, {
      params: { 
        origin,      // "latitude,longitude"
        destination, // "latitude,longitude"
        mode         // "WALKING", "DRIVING", etc.
      },
      timeout: 10000 // 10 second limit before giving up
    });

    return response.data; 
  } catch (error) {
    console.error("Failed to connect to backend:", error);
    // Rethrow so the UI can catch it and show an alert
    throw error; 
  }
};