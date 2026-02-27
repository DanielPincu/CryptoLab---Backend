import { Router } from 'express'
import { requireAuth } from '../../middleware/requireAuth.middleware'
import { trade } from './trade.controller'

const router = Router()

router.post('/', requireAuth, trade)

export default router