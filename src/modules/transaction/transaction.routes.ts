import { Router } from 'express'
import { requireAuth } from '../../middleware/requireAuth.middleware'
import { getMyTransactions } from './transaction.controller'

const router = Router()

router.get('/', requireAuth, getMyTransactions)

export default router