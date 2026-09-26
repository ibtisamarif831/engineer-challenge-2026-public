import type { LoginResponse } from '../../../shared/types'
import type { DatabaseConnection } from '../types/database'
import type { ApiHandler } from '../types/http'
import { login } from '../services/auth'
import { loginInput } from '../validation/inputs'

export function loginController(db: DatabaseConnection): ApiHandler<LoginResponse> {
  return (req, res) => {
    res.json(login(db, loginInput(req.body)))
  }
}
