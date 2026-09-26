import { requestJson } from './client'
import type { LoginResponse } from '../types'

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  return requestJson<LoginResponse>('/login', {
    method: 'POST',
    body: { email, password },
  })
}
