import type { ApiHandler } from '../types/http'
import { decodeIdentity } from '../services/auth'
import { HttpError } from '../services/errors'

function authentication(allowQueryToken: boolean): ApiHandler<unknown> {
  return (req, res, next) => {
    const header = req.headers.authorization || ''
    const headerToken = header.startsWith('Bearer ') ? header.slice(7) : header
    const token = headerToken || (allowQueryToken ? req.query.token : undefined)
    if (!token) throw new HttpError(401, 'Missing token')
    if (typeof token !== 'string') throw new HttpError(401, 'Invalid token')
    res.locals.user = decodeIdentity(token)
    next()
  }
}

export const authenticate = authentication(false)
// Retain existing export transport until the separate A006 download change.
export const authenticateExport = authentication(true)
