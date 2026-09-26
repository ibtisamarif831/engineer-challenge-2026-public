import { Router } from 'express'
import type { feedbackControllers } from '../controllers/feedback'

export function feedbackRoutes(controller: ReturnType<typeof feedbackControllers>) {
  const router = Router()
  router.get('/', controller.list)
  router.get('/:id', controller.get)
  router.post('/:id/assignment', controller.assign)
  router.get('/:id/notes', controller.notes)
  router.post('/:id/notes', controller.addNote)
  router.post('/:id/resolve', controller.resolve)
  return router
}
