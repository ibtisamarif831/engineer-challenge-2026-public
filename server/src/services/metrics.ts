import type { FeedbackStatus, Metrics, MetricsQuery } from '../../../shared/types'
import type { CountRow, DatabaseConnection } from '../types/database'

export function getMetrics(db: DatabaseConnection, query: MetricsQuery): Metrics {
  const rows = db.prepare<[string, string], CountRow & { status: FeedbackStatus }>(
    'SELECT status, COUNT(*) as count FROM feedback WHERE created_at >= ? AND created_at <= ? GROUP BY status'
  ).all(query.from, query.to)
  // Preserve existing metric scopes; aligning them is tracked separately in A022.
  const urgent = db.prepare<[string], CountRow>(
    "SELECT COUNT(*) as count FROM feedback WHERE priority = 'urgent' AND created_at >= ?"
  ).get(query.from)
  const overdue = db.prepare<[string], CountRow>(
    "SELECT COUNT(*) as count FROM feedback WHERE status = 'open' AND due_at < ?"
  ).get(new Date().toISOString())
  if (!urgent || !overdue) throw new Error('Missing metric counts')
  return {
    open: rows.find((row) => row.status === 'open')?.count || 0,
    resolved: rows.find((row) => row.status === 'resolved')?.count || 0,
    urgent: urgent.count,
    overdue: overdue.count,
  }
}
