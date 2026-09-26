import { requestJson, requestBlob } from './client'
import type { AssignmentInput, FeedbackItem, InboxResponse, InternalNote, NoteInput, NotesResponse, SummaryResponse } from '../types'

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
  return requestJson<FeedbackItem>(`/feedback/${id}/resolve`, {
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
  return requestJson<FeedbackItem>(`/feedback/${id}/assignment`, {
    method: 'POST',
    token,
    body: data,
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
  return requestJson<InternalNote>(`/feedback/${id}/notes`, {
    method: 'POST',
    token,
    body: data,
  })
}

export async function summarize(id: number, token: string): Promise<SummaryResponse> {
  return requestJson<SummaryResponse>('/summarize', {
    method: 'POST',
    token,
    body: { id },
  })
}
