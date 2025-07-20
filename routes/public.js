import express from 'express';
import { getEventByShareId } from '../controllers/eventController.js';

const router = express.Router();

// Public route to get event by share_id (no authentication required)
router.get('/events/:shareId', getEventByShareId);

export default router;