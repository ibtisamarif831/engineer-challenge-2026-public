import type { ApiHandler } from '../types/http'
import type { DatabaseConnection } from '../types/database'
import { verifyIdentity } from '../services/auth'
import { HttpError } from '../services/errors'

export function authenticate(db: DatabaseConnection): ApiHandler<unknown> {
  return (req, res, next) => {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : header
    if (!token) throw new HttpError(401, 'Missing token')
    if (typeof token !== 'string') throw new HttpError(401, 'Invalid token')
    res.locals.user = verifyIdentity(db, token)
    next()
  }
}
