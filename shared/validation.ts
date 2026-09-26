import type { AssignmentInput, LoginInput, NoteInput, SummaryInput } from './types'

/** A request payload did not satisfy the shared API contract. */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

function object(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ValidationError('Expected a JSON object')
  }
  return value as Record<string, unknown>
}

function stringValue(value: unknown, name: string): string {
  if (typeof value !== 'string') throw new ValidationError(`${name} must be a string`)
  return value
}

export function parsePositiveId(value: unknown, name = 'id'): number {
  const number = typeof value === 'string' && /^[1-9]\d*$/.test(value) ? Number(value) : value
  if (typeof number !== 'number' || !Number.isSafeInteger(number) || number <= 0) {
    throw new ValidationError(`${name} must be a positive integer`)
  }
  return number
}

function bodyId(value: unknown, name: string): number {
  if (typeof value !== 'number') throw new ValidationError(`${name} must be a number`)
  return parsePositiveId(value, name)
}

function dateValue(value: unknown, name: string): string {
  const result = stringValue(value, name)
  if (!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(result) || !Number.isFinite(Date.parse(result))) {
    throw new ValidationError(`${name} must be a valid date`)
  }
  const day = result.slice(0, 10)
  if (new Date(`${day}T00:00:00.000Z`).toISOString().slice(0, 10) !== day) {
    throw new ValidationError(`${name} must be a valid date`)
  }
  return result
}

export function parseLoginInput(value: unknown): LoginInput {
  const body = object(value)
  const email = stringValue(body.email, 'email')
  const password = stringValue(body.password, 'password')
  if (!email.trim()) throw new ValidationError('email must not be empty')
  if (!password) throw new ValidationError('password must not be empty')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError('email must be valid')
  }
  return { email, password }
}

export function parseAssignmentInput(value: unknown): AssignmentInput {
  const body = object(value)
  const priority = body.priority
  if (priority !== 'low' && priority !== 'normal' && priority !== 'high' && priority !== 'urgent') {
    throw new ValidationError('Invalid priority')
  }
  return {
    assignee_id: body.assignee_id === null ? null : bodyId(body.assignee_id, 'assignee_id'),
    priority,
    // Due dates are calendar dates in the business timezone, not instants.
    due_at: body.due_at === null || body.due_at === '' ? null : dateValue(body.due_at, 'due_at').slice(0, 10),
  }
}

export function parseNoteInput(value: unknown): NoteInput {
  const body = object(value)
  const text = stringValue(body.body, 'body')
  if (!text.trim() || text.length > 10000) {
    throw new ValidationError('Note body must contain 1 to 10000 characters')
  }
  if (typeof body.is_private !== 'boolean') throw new ValidationError('is_private must be a boolean')
  return { body: text, is_private: body.is_private }
}

export function parseSummaryInput(value: unknown): SummaryInput {
  const body = object(value)
  return { id: bodyId(body.id, 'id') }
}
