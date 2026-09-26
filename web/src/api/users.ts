import { requestJson } from './client'
import type { UsersResponse } from '../types'

export async function fetchUsers(token: string): Promise<UsersResponse> {
  return requestJson<UsersResponse>('/users', {
    token,
  })
}
