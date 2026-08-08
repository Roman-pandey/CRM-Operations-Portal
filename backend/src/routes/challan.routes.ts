import { Router } from 'express';
import * as challanController from '../controllers/challan.controller';
import { auth } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { createChallanSchema, updateChallanSchema } from '../validators/challan.validator';

const router = Router();

router.use(auth);

router.get('/', authorize('ADMIN', 'SALES', 'ACCOUNTS'), challanController.getAllChallans);
router.get('/:id', authorize('ADMIN', 'SALES', 'ACCOUNTS'), challanController.getChallanById);
router.post('/', authorize('ADMIN', 'SALES'), validate(createChallanSchema), challanController.createChallan);
router.put('/:id', authorize('ADMIN', 'SALES'), validate(updateChallanSchema), challanController.updateChallan);
router.post('/:id/confirm', authorize('ADMIN', 'SALES', 'ACCOUNTS'), challanController.confirmChallan);
router.post('/:id/cancel', authorize('ADMIN', 'SALES', 'ACCOUNTS'), challanController.cancelChallan);

export default router;
