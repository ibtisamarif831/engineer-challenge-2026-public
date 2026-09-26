import express from 'express'
import cors from 'cors'
import { summarizeText } from './integrations/llm'
import { errorHandler } from './middleware/errors'
import { apiRoutes } from './routes'
import type { DatabaseConnection } from './types/database'

// Compose the HTTP app separately from process startup and database creation.
export function createApp(db: DatabaseConnection, summarize = summarizeText) {
  const app = express()
  app.use(cors())
  app.use(express.json())
  app.use(apiRoutes(db, summarize))
  app.use((_req, res) => { res.status(404).json({ error: 'Not found' }) })
  app.use(errorHandler)
  return app
}
