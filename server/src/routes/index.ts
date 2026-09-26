import { Router } from 'express'
import { loginController } from '../controllers/auth'
import { customerController } from '../controllers/customers'
import { feedbackControllers } from '../controllers/feedback'
import { metricsController } from '../controllers/metrics'
import { usersController } from '../controllers/users'
import { authenticate, authenticateExport } from '../middleware/authenticate'
import type { DatabaseConnection } from '../types/database'
import { feedbackRoutes } from './feedback'

export function apiRoutes(db: DatabaseConnection, summarize: (prompt: string) => Promise<string>) {
  const router = Router()
  const feedback = feedbackControllers(db, summarize)
  router.post('/login', loginController(db))
  router.get('/export.csv', authenticateExport(db), feedback.exportCsv)
  router.use(authenticate(db))
  router.use('/feedback', feedbackRoutes(feedback))
  router.get('/users', usersController(db))
  router.get('/customers/:id', customerController(db))
  router.get('/metrics', metricsController(db))
  router.post('/summarize', feedback.summary)
  return router
}
