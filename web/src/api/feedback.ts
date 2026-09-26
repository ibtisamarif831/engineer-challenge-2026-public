import { requestJson, requestBlob } from './client'
import type {
  AssignmentInput, FeedbackExportQuery, FeedbackItem, InboxQuery, InboxResponse, InternalNote,
  NoteInput, NotesResponse, SummaryResponse,
} from '../types'
import { parseAssignmentInput, parseNoteInput, parsePositiveId, parseSummaryInput } from '../../../shared/validation'

function inboxQueryParams(query: Omit<InboxQuery, 'page'> & { page?: number; ids?: number[] }): URLSearchParams {
  const params = new URLSearchParams({
    page: String(query.page || 1),
    status: query.status,
    q: query.search,
    channel: query.channel,
    priority: query.priority,
    assignee: String(query.assignee),
    due: query.due,
    due_from: query.due_from,
    due_to: query.due_to,
    sort: query.sort,
    direction: query.direction,
  })
  if (query.ids?.length) params.set('ids', query.ids.join(','))
  return params
}

export async function fetchInbox(query: InboxQuery, token: string): Promise<InboxResponse> {
  const params = inboxQueryParams(query)
  return requestJson<InboxResponse>(`/feedback?${params}`, {
    token,
  })
}

export async function fetchItem(id: number, token: string): Promise<FeedbackItem> {
  return requestJson<FeedbackItem>(`/feedback/${id}`, {
    token,
  })
}

export async function toggleResolve(id: number, token: string): Promise<FeedbackItem> {
  const validatedId = parsePositiveId(id)
  return requestJson<FeedbackItem>(`/feedback/${validatedId}/resolve`, {
    method: 'POST',
    token,
  })
}

export async function exportFeedback(query: FeedbackExportQuery, token: string): Promise<Blob> {
  const params = inboxQueryParams(query)
  params.delete('page')
  return requestBlob(`/export.csv?${params}`, {
    token,
  })
}

export async function updateAssignment(
  id: number,
  data: AssignmentInput,
  token: string
): Promise<FeedbackItem> {
  const validatedId = parsePositiveId(id)
  const body = parseAssignmentInput(data)
  return requestJson<FeedbackItem>(`/feedback/${validatedId}/assignment`, {
    method: 'POST',
    token,
    body,
  })
}

export async function fetchNotes(id: number, token: string): Promise<NotesResponse> {
  return requestJson<NotesResponse>(`/feedback/${id}/notes`, {
    token,
  })
}

export async function addNote(
  id: number,
  data: NoteInput,
  token: string
): Promise<InternalNote> {
  const validatedId = parsePositiveId(id)
  const body = parseNoteInput(data)
  return requestJson<InternalNote>(`/feedback/${validatedId}/notes`, {
    method: 'POST',
    token,
    body,
  })
}

export async function summarize(id: number, token: string): Promise<SummaryResponse> {
  const body = parseSummaryInput({ id })
  return requestJson<SummaryResponse>('/summarize', {
    method: 'POST',
    token,
    body,
  })
}
