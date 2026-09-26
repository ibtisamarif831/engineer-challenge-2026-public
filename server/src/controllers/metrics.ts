import type { Metrics } from '../../../shared/types'
import type { DatabaseConnection } from '../types/database'
import type { ApiHandler } from '../types/http'
import { getMetrics } from '../services/metrics'
import { metricsQuery } from '../validation/inputs'

export function metricsController(db: DatabaseConnection): ApiHandler<Metrics> {
  return (req, res) => {
    res.json(getMetrics(db, metricsQuery(req.query)))
  }
}
