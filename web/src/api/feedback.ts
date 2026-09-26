import { requestJson, requestBlob } from './client'
import type { AssignmentInput, FeedbackItem, InboxResponse, InternalNote, NoteInput, NotesResponse, SummaryResponse } from '../types'
import { parseAssignmentInput, parseNoteInput, parsePositiveId, parseSummaryInput } from '../../../shared/validation'

export async function fetchInbox(
  page: number,
  status: string,
  search: string,
  token: string
): Promise<InboxResponse> {
  const query = new URLSearchParams({ page: String(page), status, q: search })
  return requestJson<InboxResponse>(`/feedback?${query}`, {
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

export async function exportFeedback(status: string, search: string, token: string): Promise<Blob> {
  const query = new URLSearchParams({ status, q: search })
  return requestBlob(`/export.csv?${query}`, {
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
