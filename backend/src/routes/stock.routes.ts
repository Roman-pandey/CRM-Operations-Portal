import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { auth } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

router.use(auth);
router.get('/', authorize('ADMIN', 'WAREHOUSE', 'ACCOUNTS'), productController.getStockMovements);

export default router;
