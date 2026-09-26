import type {
  AssignmentInput, FeedbackExportQuery, FeedbackFilter, FeedbackItem, InboxQuery, InboxResponse,
  InternalNote, NoteInput,
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

type QueryValue = string | number

const listFrom = `FROM feedback f
  JOIN customers c ON c.id = f.customer_id
  LEFT JOIN users u ON u.id = f.assignee_id`

function filterSql(filter: FeedbackFilter, ids: number[] = []) {
  const conditions: string[] = []
  const values: QueryValue[] = []
  if (filter.status !== 'all') {
    conditions.push('f.status = ?')
    values.push(filter.status)
  }
  if (filter.search) {
    conditions.push('(f.message LIKE ? OR f.customer_id IN (SELECT id FROM customers WHERE name LIKE ? OR email LIKE ?))')
    const pattern = `%${filter.search}%`
    values.push(pattern, pattern, pattern)
  }
  if (filter.channel !== 'all') {
    conditions.push('f.channel = ?')
    values.push(filter.channel)
  }
  if (filter.priority !== 'all') {
    conditions.push('f.priority = ?')
    values.push(filter.priority)
  }
  if (filter.assignee === 'unassigned') {
    conditions.push('f.assignee_id IS NULL')
  } else if (filter.assignee !== 'all') {
    conditions.push('f.assignee_id = ?')
    values.push(filter.assignee)
  }
  if (filter.due === 'has') {
    conditions.push('f.due_at IS NOT NULL')
  } else if (filter.due === 'none') {
    conditions.push('f.due_at IS NULL')
  } else if (filter.due === 'overdue') {
    conditions.push("f.status = 'open' AND f.due_at IS NOT NULL AND substr(f.due_at, 1, 10) < ?")
    values.push(new Date().toISOString().slice(0, 10))
  }
  if (filter.due_from) {
    conditions.push('f.due_at IS NOT NULL AND substr(f.due_at, 1, 10) >= ?')
    values.push(filter.due_from)
  }
  if (filter.due_to) {
    conditions.push('f.due_at IS NOT NULL AND substr(f.due_at, 1, 10) <= ?')
    values.push(filter.due_to)
  }
  if (ids.length) {
    conditions.push(`f.id IN (${ids.map(() => '?').join(', ')})`)
    values.push(...ids)
  }
  return { where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', values }
}

const sortExpressions: Record<InboxQuery['sort'], { asc: string; desc: string }> = {
  customer: {
    asc: 'LOWER(c.name) ASC',
    desc: 'LOWER(c.name) DESC',
  },
  priority: {
    asc: "CASE f.priority WHEN 'low' THEN 1 WHEN 'normal' THEN 2 WHEN 'high' THEN 3 WHEN 'urgent' THEN 4 ELSE 5 END ASC",
    desc: "CASE f.priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'normal' THEN 3 WHEN 'low' THEN 4 ELSE 5 END ASC",
  },
  owner: {
    asc: 'CASE WHEN u.name IS NULL THEN 1 ELSE 0 END ASC, LOWER(u.name) ASC',
    desc: 'CASE WHEN u.name IS NULL THEN 1 ELSE 0 END ASC, LOWER(u.name) DESC',
  },
  status: {
    asc: "CASE f.status WHEN 'open' THEN 1 WHEN 'resolved' THEN 2 ELSE 3 END ASC",
    desc: "CASE f.status WHEN 'resolved' THEN 1 WHEN 'open' THEN 2 ELSE 3 END ASC",
  },
  due: {
    asc: 'CASE WHEN f.due_at IS NULL THEN 1 ELSE 0 END ASC, substr(f.due_at, 1, 10) ASC',
    desc: 'CASE WHEN f.due_at IS NULL THEN 1 ELSE 0 END ASC, substr(f.due_at, 1, 10) DESC',
  },
  created_at: {
    asc: 'f.created_at ASC',
    desc: 'f.created_at DESC',
  },
}

function orderSql(query: Pick<InboxQuery, 'sort' | 'direction'>): string {
  return `ORDER BY ${sortExpressions[query.sort][query.direction]}, f.id DESC`
}

export function listFeedback(db: DatabaseConnection, query: InboxQuery): InboxResponse {
  const { where, values } = filterSql(query)
  const offset = (query.page - 1) * PAGE_SIZE
  const rows = db.prepare<QueryValue[], FeedbackRow>(
    `SELECT f.* ${listFrom} ${where} ${orderSql(query)} LIMIT ? OFFSET ?`
  ).all(...values, PAGE_SIZE, offset)
  const total = db.prepare<QueryValue[], CountRow>(`SELECT COUNT(*) as count ${listFrom} ${where}`).get(...values)
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

export function exportFeedback(db: DatabaseConnection, query: FeedbackExportQuery): string {
  const { where, values } = filterSql(query, query.ids)
  const rows = db.prepare<QueryValue[], ExportRow>(
    `SELECT f.*, c.name as customer_name, c.email as customer_email, c.plan, u.name as assignee_name,
      (SELECT GROUP_CONCAT(body, ' | ') FROM feedback_notes WHERE feedback_id = f.id) as internal_notes
     ${listFrom}
     ${where} ${orderSql(query)}`
  ).all(...values)
  const header = ['id', 'customer', 'email', 'plan', 'channel', 'priority', 'status', 'assignee', 'due_at', 'message', 'internal_notes']
  return [header.join(','), ...rows.map((row) => [
    row.id, row.customer_name, row.customer_email, row.plan, row.channel, row.priority,
    row.status, row.assignee_name, row.due_at, row.message, row.internal_notes,
  ].map(csvCell).join(','))].join('\n')
}
