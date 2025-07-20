import express from 'express';
import { getStats } from '../controllers/adminController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/stats', getStats);

export default router; 