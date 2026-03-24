import { Router } from 'express'
import { start, answer } from './game.controller'
import { requireAuth } from '../../middleware/requireAuth.middleware'

const router = Router()

router.post('/start', requireAuth, start)
router.post('/answer', requireAuth, answer)

export default router