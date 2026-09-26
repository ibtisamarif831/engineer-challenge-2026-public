import { API_URL } from './config'
import type {
  AssignmentInput, CustomerProfile, FeedbackItem, InboxResponse, InternalNote,
  LoginResponse, Metrics, NoteInput, NotesResponse, SummaryResponse, UsersResponse,
} from './types'

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    throw new Error('Login failed')
  }
  return res.json()
}

export async function fetchInbox(
  page: number,
  status: string,
  search: string,
  token: string
): Promise<InboxResponse> {
  const query = new URLSearchParams({ page: String(page), status, q: search })
  const res = await fetch(`${API_URL}/feedback?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function fetchItem(id: number, token: string): Promise<FeedbackItem> {
  const res = await fetch(`${API_URL}/feedback/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function toggleResolve(id: number, token: string): Promise<FeedbackItem> {
  const res = await fetch(`${API_URL}/feedback/${id}/resolve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function fetchUsers(token: string): Promise<UsersResponse> {
  const res = await fetch(`${API_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function fetchMetrics(token: string): Promise<Metrics> {
  const res = await fetch(`${API_URL}/metrics`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function exportFeedback(status: string, search: string, token: string): Promise<Blob> {
  const query = new URLSearchParams({ status, q: search })
  const res = await fetch(`${API_URL}/export.csv?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Unable to export feedback')
  return res.blob()
}

export async function fetchCustomer(id: number, token: string): Promise<CustomerProfile> {
  const res = await fetch(`${API_URL}/customers/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function updateAssignment(
  id: number,
  data: AssignmentInput,
  token: string
): Promise<FeedbackItem> {
  const res = await fetch(`${API_URL}/feedback/${id}/assignment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Unable to save assignment')
  return res.json()
}

export async function fetchNotes(id: number, token: string): Promise<NotesResponse> {
  const res = await fetch(`${API_URL}/feedback/${id}/notes`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

export async function addNote(
  id: number,
  data: NoteInput,
  token: string
): Promise<InternalNote> {
  const res = await fetch(`${API_URL}/feedback/${id}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Unable to save note')
  return res.json()
}

export async function summarize(id: number, token: string): Promise<SummaryResponse> {
  const res = await fetch(`${API_URL}/summarize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id }),
  })
  return res.json()
}
