import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { auth } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

router.use(auth, authorize('ADMIN'));

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
