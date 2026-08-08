import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { auth } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { createProductSchema, updateProductSchema, stockAdjustmentSchema } from '../validators/product.validator';

const router = Router();

router.use(auth);

router.get('/low-stock', authorize('ADMIN', 'WAREHOUSE', 'ACCOUNTS'), productController.getLowStockProducts);
router.get('/', authorize('ADMIN', 'WAREHOUSE', 'ACCOUNTS'), productController.getAllProducts);
router.get('/:id', authorize('ADMIN', 'WAREHOUSE', 'ACCOUNTS'), productController.getProductById);
router.post('/', authorize('ADMIN', 'WAREHOUSE'), validate(createProductSchema), productController.createProduct);
router.put('/:id', authorize('ADMIN', 'WAREHOUSE'), validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', authorize('ADMIN', 'WAREHOUSE'), productController.deleteProduct);

router.post('/:id/stock', authorize('ADMIN', 'WAREHOUSE'), validate(stockAdjustmentSchema), productController.adjustStock);
router.get('/:id/stock-movements', authorize('ADMIN', 'WAREHOUSE', 'ACCOUNTS'), productController.getStockMovements);

export default router;
