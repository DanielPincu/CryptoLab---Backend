import { Router } from 'express'
import { requireAuth } from '../../middleware/requireAuth.middleware'
import {
  portfolioSummary
} from './portfolio.controller'

const router = Router()

router.get('/summary', requireAuth, portfolioSummary)

export default router