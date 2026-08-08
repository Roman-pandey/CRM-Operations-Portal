import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginSchema } from '../validators/auth.validator';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.get('/me', auth, authController.me);

export default router;
