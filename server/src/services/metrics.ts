import type { FeedbackStatus, Metrics, MetricsQuery } from '../../../shared/types'
import type { CountRow, DatabaseConnection } from '../types/database'

export function getMetrics(db: DatabaseConnection, query: MetricsQuery): Metrics {
  const endExclusive = new Date(`${query.to.slice(0, 10)}T00:00:00.000Z`)
  endExclusive.setUTCDate(endExclusive.getUTCDate() + 1)
  const from = query.from
  const to = endExclusive.toISOString()
  const rows = db.prepare<[string, string], CountRow & { status: FeedbackStatus }>(
    'SELECT status, COUNT(*) as count FROM feedback WHERE created_at >= ? AND created_at < ? GROUP BY status'
  ).all(from, to)
  const urgent = db.prepare<[string, string], CountRow>(
    "SELECT COUNT(*) as count FROM feedback WHERE priority = 'urgent' AND created_at >= ? AND created_at < ?"
  ).get(from, to)
  const overdue = db.prepare<[string, string], CountRow>(
    "SELECT COUNT(*) as count FROM feedback WHERE status = 'open' AND due_at IS NOT NULL AND due_at >= ? AND due_at < ?"
  ).get(from.slice(0, 10), to.slice(0, 10))
  if (!urgent || !overdue) throw new Error('Missing metric counts')
  return {
    open: rows.find((row) => row.status === 'open')?.count || 0,
    resolved: rows.find((row) => row.status === 'resolved')?.count || 0,
    urgent: urgent.count,
    overdue: overdue.count,
  }
}
