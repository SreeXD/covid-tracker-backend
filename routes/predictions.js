import express from 'express';

import { getPrediction } from '../controllers/predictions.js';

const router = express.Router();

router.get('/:date', getPrediction);

export default router;