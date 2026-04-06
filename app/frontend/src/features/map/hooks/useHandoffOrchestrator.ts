import { useState, useCallback } from "react";
import type { IndoorBuildingId } from "../../../services/floorPlanService";
import {
  buildHandoffRoute,
  type HandoffRouteResult,
  type HandoffError,
  type HandoffRouteRequest,
} from "../utils/handoffOrchestrator";
 
export type HandoffState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; route: HandoffRouteResult }
  | { status: "error"; error: HandoffError };
 
export function useHandoffOrchestrator() {
  const [state, setState] = useState<HandoffState>({ status: "idle" });
 
  const navigate = useCallback(async (request: HandoffRouteRequest) => {
    setState({ status: "loading" });
 
    const result = await buildHandoffRoute(request);
 
    if (result.ok) {
      setState({ status: "success", route: result.route });
    } else {
      setState({ status: "error", error: result.error });
    }
 
    return result;
  }, []);
 
  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);
 
  return { state, navigate, reset };
}