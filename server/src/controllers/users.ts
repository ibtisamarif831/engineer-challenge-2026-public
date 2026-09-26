import type { UsersResponse } from '../../../shared/types'
import type { DatabaseConnection } from '../types/database'
import type { ApiHandler } from '../types/http'
import { listUsers } from '../services/users'

export function usersController(db: DatabaseConnection): ApiHandler<UsersResponse> {
  return (_req, res) => {
    res.json({ users: listUsers(db) })
  }
}
