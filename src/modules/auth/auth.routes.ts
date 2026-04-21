import { Router } from 'express';
import { validateBody } from '../../middleware/joi.middleware';
import { registerSchema, loginSchema } from './auth.validation';
import { register, login, logout } from './auth.controller';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/logout', logout);

export default router;
