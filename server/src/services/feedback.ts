import type {
  AssignmentInput, FeedbackFilter, FeedbackItem, InboxQuery, InboxResponse, InternalNote, NoteInput,
} from '../../../shared/types'
import type { CountRow, CustomerRow, DatabaseConnection, ExportRow, FeedbackRow, UserRow } from '../types/database'
import { HttpError } from './errors'

const PAGE_SIZE = 10

export function serializeFeedback(db: DatabaseConnection, row: FeedbackRow): FeedbackItem {
  const customer = db.prepare<[number], CustomerRow>('SELECT * FROM customers WHERE id = ?').get(row.customer_id)
  const assignee = row.assignee_id === null ? undefined
    : db.prepare<[number], UserRow>('SELECT * FROM users WHERE id = ?').get(row.assignee_id)
  if (!customer) throw new Error('Missing feedback customer')
  return {
    id: row.id,
    customer_id: row.customer_id,
    channel: row.channel,
    message: row.message,
    status: row.status,
    priority: row.priority,
    assignee_id: row.assignee_id,
    due_at: row.due_at,
    created_at: row.created_at,
    customer_name: customer.name,
    customer_email: customer.email,
    assignee_name: assignee?.name || null,
  }
}

function feedbackRow(db: DatabaseConnection, id: number): FeedbackRow {
  const row = db.prepare<[number], FeedbackRow>('SELECT * FROM feedback WHERE id = ?').get(id)
  if (!row) throw new HttpError(404, 'Not found')
  return row
}

export function getFeedback(db: DatabaseConnection, id: number): FeedbackItem {
  return serializeFeedback(db, feedbackRow(db, id))
}

function filterSql(filter: FeedbackFilter) {
  const conditions: string[] = []
  const values: string[] = []
  if (filter.status !== 'all') {
    conditions.push('f.status = ?')
    values.push(filter.status)
  }
  if (filter.search) {
    conditions.push('(f.message LIKE ? OR f.customer_id IN (SELECT id FROM customers WHERE name LIKE ? OR email LIKE ?))')
    const pattern = `%${filter.search}%`
    values.push(pattern, pattern, pattern)
  }
  return { where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', values }
}

export function listFeedback(db: DatabaseConnection, query: InboxQuery): InboxResponse {
  const { where, values } = filterSql(query)
  const offset = (query.page - 1) * PAGE_SIZE
  const rows = db.prepare<(string | number)[], FeedbackRow>(
    `SELECT f.* FROM feedback f ${where} ORDER BY f.created_at DESC, f.id DESC LIMIT ? OFFSET ?`
  ).all(...values, PAGE_SIZE, offset)
  const total = db.prepare<(string | number)[], CountRow>(`SELECT COUNT(*) as count FROM feedback f ${where}`).get(...values)
  if (!total) throw new Error('Missing feedback count')
  return { items: rows.map((row) => serializeFeedback(db, row)), total: total.count, page: query.page }
}

export function assignFeedback(db: DatabaseConnection, id: number, input: AssignmentInput): FeedbackItem {
  feedbackRow(db, id)
  if (input.assignee_id !== null && !db.prepare<[number], Pick<UserRow, 'id'>>('SELECT id FROM users WHERE id = ?').get(input.assignee_id)) {
    throw new HttpError(404, 'Assignee not found')
  }
  db.prepare<[number | null, string, string | null, number]>(
    'UPDATE feedback SET assignee_id = ?, priority = ?, due_at = ? WHERE id = ?'
  ).run(input.assignee_id, input.priority, input.due_at || null, id)
  return getFeedback(db, id)
}

export function toggleFeedback(db: DatabaseConnection, id: number): FeedbackItem {
  const row = feedbackRow(db, id)
  const status = row.status === 'open' ? 'resolved' : 'open'
  db.prepare<[string, number]>('UPDATE feedback SET status = ? WHERE id = ?').run(status, id)
  return getFeedback(db, id)
}

const noteSelect = `SELECT n.*, u.name as author_name, u.email as author_email
  FROM feedback_notes n LEFT JOIN users u ON u.id = n.author_id`

export function listNotes(db: DatabaseConnection, id: number): InternalNote[] {
  feedbackRow(db, id)
  return db.prepare<[number], InternalNote>(`${noteSelect} WHERE n.feedback_id = ? ORDER BY n.created_at DESC`).all(id)
}

export function createNote(db: DatabaseConnection, id: number, authorId: number, input: NoteInput): InternalNote {
  feedbackRow(db, id)
  if (!db.prepare<[number], Pick<UserRow, 'id'>>('SELECT id FROM users WHERE id = ?').get(authorId)) {
    throw new HttpError(404, 'Author not found')
  }
  const result = db.prepare<[number, number, string, number, string]>(
    'INSERT INTO feedback_notes (feedback_id, author_id, body, is_private, created_at) VALUES (?, ?, ?, ?, ?)'
  ).run(id, authorId, input.body, input.is_private ? 1 : 0, new Date().toISOString())
  const note = db.prepare<[number | bigint], InternalNote>(`${noteSelect} WHERE n.id = ?`).get(result.lastInsertRowid)
  if (!note) throw new Error('Missing created note')
  return note
}

export async function summarizeFeedback(db: DatabaseConnection, id: number, summarize: (prompt: string) => Promise<string>): Promise<string> {
  const row = feedbackRow(db, id)
  return summarize(`Summarize the following customer feedback in one or two short sentences for a support agent.\n\n${row.message}`)
}

function csvCell(value: unknown): string {
  const text = String(value ?? '')
  // Keep untrusted spreadsheet text inert, including whitespace/control-prefixed formulas.
  const unsafePrefix = /^(?:[\s\u0000-\u001f\u007f-\u009f]*[=+\-@＝＋－＠]|[\u0000-\u001f\u007f-\u009f])/
  const safeText = unsafePrefix.test(text) ? `'${text}` : text
  return `"${safeText.replace(/"/g, '""')}"`
}

export function exportFeedback(db: DatabaseConnection, filter: FeedbackFilter): string {
  const { where, values } = filterSql(filter)
  const rows = db.prepare<string[], ExportRow>(
    `SELECT f.*, c.name as customer_name, c.email as customer_email, c.plan, u.name as assignee_name,
      (SELECT GROUP_CONCAT(body, ' | ') FROM feedback_notes WHERE feedback_id = f.id) as internal_notes
     FROM feedback f JOIN customers c ON c.id = f.customer_id LEFT JOIN users u ON u.id = f.assignee_id
     ${where} ORDER BY f.created_at DESC`
  ).all(...values)
  const header = ['id', 'customer', 'email', 'plan', 'channel', 'priority', 'status', 'assignee', 'due_at', 'message', 'internal_notes']
  return [header.join(','), ...rows.map((row) => [
    row.id, row.customer_name, row.customer_email, row.plan, row.channel, row.priority,
    row.status, row.assignee_name, row.due_at, row.message, row.internal_notes,
  ].map(csvCell).join(','))].join('\n')
}
