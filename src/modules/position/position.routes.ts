import { Router } from 'express'
import { requireAuth } from '../../middleware/requireAuth.middleware'
import { getMyPositions } from './position.controller'

const router = Router()

router.get('/', requireAuth, getMyPositions)

export default router