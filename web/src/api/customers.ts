import { requestJson } from './client'
import type { CustomerProfile } from '../types'

export async function fetchCustomer(id: number, token: string): Promise<CustomerProfile> {
  return requestJson<CustomerProfile>(`/customers/${id}`, {
    token,
  })
}
