import express from 'express';
import { getDaily, getTimeseries } from '../controllers/fallback.js';

const router = express.Router();

router.get('/daily.json', getDaily);
router.get('/timeseries.json', getTimeseries);

export default router;