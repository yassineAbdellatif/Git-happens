import { Router } from "express";
import { getRoute } from "../controllers/mapController";
import {
  getShuttleSchedule,
  getShuttleDepartures,
  getShuttleRoutes,
} from "../controllers/shuttleController";

const router = Router();
router.get("/directions", getRoute);
router.get("/shuttle/schedule", getShuttleSchedule);
router.get("/shuttle/departures", getShuttleDepartures);
router.get("/shuttle/routes", getShuttleRoutes);
export default router;
