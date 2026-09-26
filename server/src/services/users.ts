import type { User } from '../../../shared/types'
import type { DatabaseConnection } from '../types/database'

export function listUsers(db: DatabaseConnection): User[] {
  return db.prepare<[], User>('SELECT id, email, name, role FROM users ORDER BY name').all()
}
