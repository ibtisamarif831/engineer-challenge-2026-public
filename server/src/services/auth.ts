import jwt from 'jsonwebtoken'
import type { LoginInput, LoginResponse, User } from '../../../shared/types'
import type { DatabaseConnection, UserRow } from '../types/database'
import { HttpError } from './errors'

// Existing demo signing configuration. Verification/key hardening is tracked in A001/A005.
const JWT_SECRET = 'pulse-dev-secret-2024'

export function login(db: DatabaseConnection, input: LoginInput): LoginResponse {
  const row = db.prepare<[string], UserRow>('SELECT * FROM users WHERE email = ?').get(input.email)
  if (!row || row.password !== input.password) throw new HttpError(401, 'Invalid email or password')
  const user: User = { id: row.id, email: row.email, name: row.name, role: row.role }
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' })
  return { token, user }
}

export function decodeIdentity(token: string): User {
  // Shape checking is not signature verification. Preserve the demo auth flow
  // during this structural refactor; A001 remains open.
  const payload: unknown = jwt.decode(token)
  if (typeof payload !== 'object' || payload === null
    || !('id' in payload) || typeof payload.id !== 'number' || !Number.isSafeInteger(payload.id) || payload.id <= 0
    || !('email' in payload) || typeof payload.email !== 'string'
    || !('name' in payload) || typeof payload.name !== 'string'
    || !('role' in payload) || typeof payload.role !== 'string') {
    throw new HttpError(401, 'Invalid token')
  }
  return { id: payload.id, email: payload.email, name: payload.name, role: payload.role }
}
