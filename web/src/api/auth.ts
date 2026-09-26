import { requestJson } from './client'
import type { LoginResponse } from '../types'
import { parseLoginInput } from '../../../shared/validation'

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const body = parseLoginInput({ email, password })
  return requestJson<LoginResponse>('/login', {
    method: 'POST',
    body,
  })
}
