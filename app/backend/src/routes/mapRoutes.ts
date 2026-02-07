import { Router } from 'express';
import { getRoute } from '../controllers/mapController';

const router = Router();
router.get('/directions', getRoute);
export default router;

