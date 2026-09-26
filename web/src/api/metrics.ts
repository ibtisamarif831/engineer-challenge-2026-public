import { requestJson } from './client'
import type { Metrics } from '../types'

export async function fetchMetrics(token: string): Promise<Metrics> {
  return requestJson<Metrics>('/metrics', {
    token,
  })
}
