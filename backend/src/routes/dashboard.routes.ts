import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { auth } from '../middleware/auth';

const router = Router();

router.use(auth);
router.get('/', dashboardController.getDashboardStats);

export default router;
