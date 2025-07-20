import express from 'express';
import {
  createRegistration,
  getUserRegistrations,
  updateRegistration,
  checkIn
} from '../controllers/registrationController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', createRegistration);
router.get('/', getUserRegistrations);
router.put('/:registrationId', updateRegistration);
router.post('/:registrationId/check-in', checkIn);

export default router; 