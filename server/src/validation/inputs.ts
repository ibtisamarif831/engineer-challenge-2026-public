import type {
  AssignmentInput, FeedbackFilter, InboxQuery, LoginInput, MetricsQuery, NoteInput,
} from '../../../shared/types'
import { HttpError } from '../services/errors'

export function object(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new HttpError(400, 'Expected a JSON object')
  }
  return value as Record<string, unknown>
}

function string(value: unknown, name: string): string {
  if (typeof value !== 'string') throw new HttpError(400, `${name} must be a string`)
  return value
}

export function positiveId(value: unknown, name = 'id'): number {
  const number = typeof value === 'string' && /^[1-9]\d*$/.test(value) ? Number(value) : value
  if (typeof number !== 'number' || !Number.isSafeInteger(number) || number <= 0) {
    throw new HttpError(400, `${name} must be a positive integer`)
  }
  return number
}

function bodyId(value: unknown, name: string): number {
  if (typeof value !== 'number') throw new HttpError(400, `${name} must be a number`)
  return positiveId(value, name)
}

function date(value: unknown, name: string): string {
  const result = string(value, name)
  if (!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(result) || !Number.isFinite(Date.parse(result))) {
    throw new HttpError(400, `${name} must be a valid date`)
  }
  // Date.parse normalizes impossible dates such as February 30.
  const day = result.slice(0, 10)
  if (new Date(`${day}T00:00:00.000Z`).toISOString().slice(0, 10) !== day) {
    throw new HttpError(400, `${name} must be a valid date`)
  }
  return result
}

export function loginInput(value: unknown): LoginInput {
  const body = object(value)
  return { email: string(body.email, 'email'), password: string(body.password, 'password') }
}

export function feedbackFilter(query: Record<string, unknown>): FeedbackFilter {
  const status = query.status === undefined || query.status === '' ? 'all' : query.status
  if (status !== 'all' && status !== 'open' && status !== 'resolved') {
    throw new HttpError(400, 'Invalid status')
  }
  return { status, search: query.q === undefined ? '' : string(query.q, 'q').trim() }
}

export function inboxQuery(query: Record<string, unknown>): InboxQuery {
  return { ...feedbackFilter(query), page: positiveId(query.page ?? '1', 'page') }
}

export function metricsQuery(query: Record<string, unknown>): MetricsQuery {
  return {
    from: query.from === undefined ? '1970-01-01T00:00:00.000Z' : date(query.from, 'from'),
    to: query.to === undefined ? new Date().toISOString() : date(query.to, 'to'),
  }
}

export function assignmentInput(value: unknown): AssignmentInput {
  const body = object(value)
  const priority = body.priority
  if (priority !== 'low' && priority !== 'normal' && priority !== 'high' && priority !== 'urgent') {
    throw new HttpError(400, 'Invalid priority')
  }
  return {
    assignee_id: body.assignee_id === null ? null : bodyId(body.assignee_id, 'assignee_id'),
    priority,
    due_at: body.due_at === null || body.due_at === '' ? body.due_at : date(body.due_at, 'due_at'),
  }
}

export function noteInput(value: unknown): NoteInput {
  const body = object(value)
  const text = string(body.body, 'body')
  if (!text.trim() || text.length > 10000) {
    throw new HttpError(400, 'Note body must contain 1 to 10000 characters')
  }
  if (typeof body.is_private !== 'boolean') throw new HttpError(400, 'is_private must be a boolean')
  return { body: text, is_private: body.is_private }
}

export function summaryId(value: unknown): number {
  return bodyId(object(value).id, 'id')
}
