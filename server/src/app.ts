import express from 'express'
import cors from 'cors'
import { summarizeText } from './integrations/llm'
import { errorHandler } from './middleware/errors'
import { apiRoutes } from './routes'
import type { DatabaseConnection } from './types/database'
import { CORS_ORIGINS } from './config'

// Compose the HTTP app separately from process startup and database creation.
export function createApp(db: DatabaseConnection, summarize = summarizeText) {
  const app = express()
  app.disable('x-powered-by')
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || CORS_ORIGINS.includes(origin)) return callback(null, true)
      return callback(null, false)
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    optionsSuccessStatus: 204,
  }))
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('Referrer-Policy', 'no-referrer')
    res.setHeader('Cache-Control', 'no-store')
    next()
  })
  app.use(express.json())
  app.use(apiRoutes(db, summarize))
  app.use((_req, res) => { res.status(404).json({ error: 'Not found' }) })
  app.use(errorHandler)
  return app
}
