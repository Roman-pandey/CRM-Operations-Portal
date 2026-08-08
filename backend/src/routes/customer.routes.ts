import { Router } from 'express';
import * as customerController from '../controllers/customer.controller';
import { auth } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { createCustomerSchema, updateCustomerSchema, createFollowupSchema } from '../validators/customer.validator';

const router = Router();

router.use(auth);

router.get('/', authorize('ADMIN', 'SALES', 'ACCOUNTS'), customerController.getAllCustomers);
router.get('/:id', authorize('ADMIN', 'SALES', 'ACCOUNTS'), customerController.getCustomerById);
router.post('/', authorize('ADMIN', 'SALES'), validate(createCustomerSchema), customerController.createCustomer);
router.put('/:id', authorize('ADMIN', 'SALES'), validate(updateCustomerSchema), customerController.updateCustomer);
router.delete('/:id', authorize('ADMIN', 'SALES'), customerController.deleteCustomer);

router.get('/:id/followups', authorize('ADMIN', 'SALES', 'ACCOUNTS'), customerController.getFollowups);
router.post('/:id/followups', authorize('ADMIN', 'SALES'), validate(createFollowupSchema), customerController.createFollowup);

export default router;
