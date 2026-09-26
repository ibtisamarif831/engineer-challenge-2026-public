import type {
  AssignmentInput, FeedbackChannel, FeedbackDueFilter, FeedbackExportQuery, FeedbackFilter,
  FeedbackPriority, InboxQuery, InboxSortField, LoginInput, MetricsQuery, NoteInput, SortDirection,
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

function optionalString(query: Record<string, unknown>, key: string): string {
  return query[key] === undefined ? '' : string(query[key], key).trim()
}

function oneOf<T extends string>(value: string, values: readonly T[], name: string): T {
  if (!values.includes(value as T)) throw new HttpError(400, `Invalid ${name}`)
  return value as T
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

function calendarDate(value: string, name: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(`${value}T00:00:00.000Z`))) {
    throw new HttpError(400, `${name} must be a valid date`)
  }
  if (new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) !== value) {
    throw new HttpError(400, `${name} must be a valid date`)
  }
  return value
}

export function loginInput(value: unknown): LoginInput {
  return serverValidation(parseLoginInput, value)
}

export function feedbackFilter(query: Record<string, unknown>): FeedbackFilter {
  const statusValue = optionalString(query, 'status') || 'all'
  const channelValue = optionalString(query, 'channel') || 'all'
  const priorityValue = optionalString(query, 'priority') || 'all'
  const assigneeValue = optionalString(query, 'assignee') || 'all'
  const dueValue = optionalString(query, 'due') || 'all'
  const dueFrom = optionalString(query, 'due_from')
  const dueTo = optionalString(query, 'due_to')

  const status = oneOf(statusValue, ['all', 'open', 'resolved'] as const, 'status')
  const channel = oneOf(channelValue, ['all', 'email', 'chat', 'app store'] as const, 'channel') as FeedbackChannel | 'all'
  const priority = oneOf(priorityValue, ['all', 'low', 'normal', 'high', 'urgent'] as const, 'priority') as FeedbackPriority | 'all'
  const due = oneOf(dueValue, ['all', 'has', 'none', 'overdue'] as const, 'due') as FeedbackDueFilter
  let assignee: FeedbackFilter['assignee'] = 'all'
  if (assigneeValue === 'unassigned') assignee = 'unassigned'
  else if (assigneeValue !== 'all') assignee = positiveId(assigneeValue, 'assignee')

  const parsedDueFrom = dueFrom ? calendarDate(dueFrom, 'due_from') : ''
  const parsedDueTo = dueTo ? calendarDate(dueTo, 'due_to') : ''
  if (parsedDueFrom && parsedDueTo && parsedDueFrom > parsedDueTo) {
    throw new HttpError(400, 'due_from must not be after due_to')
  }

  return {
    status,
    search: optionalString(query, 'q'),
    channel,
    priority,
    assignee,
    due,
    due_from: parsedDueFrom,
    due_to: parsedDueTo,
  }
}

function sortQuery(query: Record<string, unknown>): Pick<InboxQuery, 'sort' | 'direction'> {
  const sortValue = optionalString(query, 'sort') || 'created_at'
  const directionValue = optionalString(query, 'direction') || (sortValue === 'created_at' ? 'desc' : 'asc')
  return {
    sort: oneOf(sortValue, ['customer', 'priority', 'owner', 'status', 'due', 'created_at'] as const, 'sort') as InboxSortField,
    direction: oneOf(directionValue, ['asc', 'desc'] as const, 'direction') as SortDirection,
  }
}

function exportIds(value: unknown): number[] {
  if (value === undefined || value === '') return []
  const raw = string(value, 'ids').split(',')
  if (raw.some((id) => !id)) throw new HttpError(400, 'ids must contain positive integers')
  return [...new Set(raw.map((id) => positiveId(id, 'ids')))]
}

export function inboxQuery(query: Record<string, unknown>): InboxQuery {
  return {
    ...feedbackFilter(query),
    page: positiveId(query.page ?? '1', 'page'),
    ...sortQuery(query),
  }
}

export function feedbackExportQuery(query: Record<string, unknown>): FeedbackExportQuery {
  return {
    ...feedbackFilter(query),
    ids: exportIds(query.ids),
    ...sortQuery(query),
  }
}

export function metricsQuery(query: Record<string, unknown>): MetricsQuery {
  const result = {
    from: query.from === undefined ? '1970-01-01T00:00:00.000Z' : date(query.from, 'from'),
    to: query.to === undefined ? new Date().toISOString() : date(query.to, 'to'),
  }
  if (Date.parse(result.from) > Date.parse(result.to)) throw new HttpError(400, 'from must not be after to')
  return result
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
