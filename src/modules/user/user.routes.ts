import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth.middleware';
import { getUserInfo, updateMe, changePassword} from './user.controller';

const router = Router();

// Get current user profile
router.get('/me', requireAuth, getUserInfo);

// Update current user profile
router.patch('/me', requireAuth, updateMe);

// Change password
router.patch('/me/password', requireAuth, changePassword);

export default router;