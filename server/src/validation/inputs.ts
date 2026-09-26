import type {
  AssignmentInput, FeedbackFilter, InboxQuery, LoginInput, MetricsQuery, NoteInput,
} from '../../../shared/types'
import {
  parseAssignmentInput, parseLoginInput, parseNoteInput, parsePositiveId, parseSummaryInput,
  ValidationError,
} from '../../../shared/validation'
import { HttpError } from '../services/errors'

function serverValidation<T>(parse: (value: unknown) => T, value: unknown): T {
  try {
    return parse(value)
  } catch (error) {
    if (error instanceof ValidationError) throw new HttpError(400, error.message)
    throw error
  }
}

function string(value: unknown, name: string): string {
  if (typeof value !== 'string') throw new HttpError(400, `${name} must be a string`)
  return value
}

export function positiveId(value: unknown, name = 'id'): number {
  return serverValidation((input) => parsePositiveId(input, name), value)
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
  return serverValidation(parseLoginInput, value)
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
  return serverValidation(parseAssignmentInput, value)
}

export function noteInput(value: unknown): NoteInput {
  return serverValidation(parseNoteInput, value)
}

export function summaryId(value: unknown): number {
  return serverValidation(parseSummaryInput, value).id
}
