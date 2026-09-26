import type { ErrorRequestHandler } from 'express'
import type { ApiError } from '../../../shared/types'
import { HttpError } from '../services/errors'

function parserStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('type' in error)) return undefined
  if (error.type === 'entity.parse.failed') return 400
  if (error.type === 'entity.too.large') return 413
  if (error.type === 'encoding.unsupported' || error.type === 'charset.unsupported') return 415
  return undefined
}

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, next) => {
  if (res.headersSent) {
    next(error)
    return
  }
  const status = error instanceof HttpError ? error.status : parserStatus(error) ?? 500
  const message = error instanceof HttpError ? error.message
    : status === 400 ? 'Invalid JSON body'
    : status === 413 ? 'Request body too large'
    : status === 415 ? 'Unsupported body encoding'
    : 'Something went wrong'
  if (status >= 500) console.error('API request failed')
  const body: ApiError = { error: message }
  res.status(status).json(body)
}
