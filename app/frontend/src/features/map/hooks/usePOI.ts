import { useState, useCallback } from "react";
import { getNearbyPlaces, POIResult } from "../../../services/mapApiService";

export type POIType = {
  key: string;
  label: string;
  icon: string;
  color: string;
};

export const POI_TYPES: POIType[] = [
  { key: "cafe",              label: "Coffee",    icon: "local-cafe",     color: "#6F4E37" },
  { key: "restaurant",        label: "Food",      icon: "restaurant",     color: "#E8472A" },
  { key: "fast_food",         label: "Fast Food", icon: "fastfood",       color: "#F5A623" },
  { key: "bakery",            label: "Bakery",    icon: "cake",           color: "#D4845A" },
  { key: "pharmacy",          label: "Pharmacy",  icon: "local-pharmacy", color: "#1A9B5F" },
  { key: "atm",               label: "ATM",       icon: "local-atm",      color: "#4285F4" },
  { key: "convenience_store", label: "Store",     icon: "store",          color: "#7B1FA2" },
  { key: "gym",               label: "Gym",       icon: "fitness-center", color: "#0097A7" },
];

export const MAX_RESULTS_OPTIONS = [5, 10, 15];

export interface UsePOIReturn {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  selectedType: POIType | null;
  setSelectedType: (t: POIType | null) => void;
  maxResults: number;
  setMaxResults: (n: number) => void;
  results: POIResult[];
  isLoading: boolean;
  error: string | null;
  search: (latitude: number, longitude: number) => Promise<void>;
  clearResults: () => void;
}

export const usePOI = (): UsePOIReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<POIType | null>(null);
  const [maxResults, setMaxResults] = useState(10);
  const [results, setResults] = useState<POIResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (latitude: number, longitude: number) => {
      if (!selectedType) return;
      setIsLoading(true);
      setError(null);
      try {
        console.log("DEBUG:", { latitude, longitude, type: selectedType.key, maxResults })
        const places = await getNearbyPlaces(latitude, longitude, selectedType.key, maxResults);
        setResults(places);
        if (places.length === 0) {
          setError("No places found nearby. Try a different type or increase the count.");
        }
      } catch {
        setError("Could not load nearby places. Check your connection.");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedType, maxResults],
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    setSelectedType(null);
  }, []);

  return {
    isOpen,
    setIsOpen,
    selectedType,
    setSelectedType,
    maxResults,
    setMaxResults,
    results,
    isLoading,
    error,
    search,
    clearResults,
  };
};
