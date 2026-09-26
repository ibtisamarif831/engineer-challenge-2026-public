import jwt from 'jsonwebtoken'
import type { LoginInput, LoginResponse, User } from '../../../shared/types'
import type { DatabaseConnection, UserRow } from '../types/database'
import { HttpError } from './errors'
import { JWT_SECRET } from '../config'

export function login(db: DatabaseConnection, input: LoginInput): LoginResponse {
  const row = db.prepare<[string], UserRow>('SELECT * FROM users WHERE email = ?').get(input.email)
  if (!row || row.password !== input.password) throw new HttpError(401, 'Invalid email or password')
  const user: User = { id: row.id, email: row.email, name: row.name, role: row.role }
  const token = jwt.sign(user, JWT_SECRET, { algorithm: 'HS256', expiresIn: '7d' })
  return { token, user }
}

export function verifyIdentity(db: DatabaseConnection, token: string): User {
  let payload: unknown
  try {
    payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] })
  } catch {
    throw new HttpError(401, 'Invalid token')
  }
  if (typeof payload !== 'object' || payload === null
    || !('id' in payload) || typeof payload.id !== 'number' || !Number.isSafeInteger(payload.id) || payload.id <= 0
    || !('exp' in payload) || typeof payload.exp !== 'number' || !Number.isFinite(payload.exp)
    || !('email' in payload) || typeof payload.email !== 'string'
    || !('name' in payload) || typeof payload.name !== 'string'
    || !('role' in payload) || typeof payload.role !== 'string') {
    throw new HttpError(401, 'Invalid token')
  }
  // Resolve current identity from the database rather than trusting stale token fields.
  const user = db.prepare<[number], User>('SELECT id, email, name, role FROM users WHERE id = ?').get(payload.id)
  if (!user) throw new HttpError(401, 'Invalid token')
  return user
}
