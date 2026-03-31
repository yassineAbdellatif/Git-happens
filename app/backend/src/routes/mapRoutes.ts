import { Router } from 'express';
import { getRoute, getNearbyPlaces } from '../controllers/mapController';

const router = Router();
router.get('/directions', getRoute);
router.get('/places/nearby', getNearbyPlaces);
export default router;

