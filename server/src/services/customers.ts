import type { CustomerProfile } from '../../../shared/types'
import type { CustomerRow, DatabaseConnection, FeedbackRow } from '../types/database'
import { HttpError } from './errors'
import { serializeFeedback } from './feedback'

export function getCustomer(db: DatabaseConnection, id: number): CustomerProfile {
  const customer = db.prepare<[number], CustomerRow>('SELECT * FROM customers WHERE id = ?').get(id)
  if (!customer) throw new HttpError(404, 'Not found')
  const history = db.prepare<[number], FeedbackRow>(
    'SELECT * FROM feedback WHERE customer_id = ? ORDER BY created_at DESC LIMIT 8'
  ).all(id)
  return { ...customer, history: history.map((row) => serializeFeedback(db, row)) }
}
