export type FeedbackItem = {
  id: number
  customer_id: number
  customer_name: string
  customer_email: string
  channel: string
  message: string
  status: 'open' | 'resolved'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  assignee_id: number | null
  assignee_name: string | null
  due_at: string | null
  created_at: string
}

export type User = {
  id: number
  email: string
  name: string
  role: string
}

export type InternalNote = {
  id: number
  feedback_id: number
  author_id: number
  author_name: string | null
  author_email: string | null
  body: string
  is_private: 0 | 1
  created_at: string
}

export type CustomerProfile = {
  id: number
  name: string
  email: string
  plan: string
  health_score: number
  history: FeedbackItem[]
}

export type Metrics = {
  open: number
  resolved: number
  urgent: number
  overdue: number
}

export type FeedbackStatus = FeedbackItem['status']
export type FeedbackPriority = FeedbackItem['priority']
export type FeedbackChannel = 'email' | 'chat' | 'app store'
export type FeedbackAssigneeFilter = number | 'all' | 'unassigned'
export type FeedbackDueFilter = 'all' | 'has' | 'none' | 'overdue'
export type InboxSortField = 'customer' | 'priority' | 'owner' | 'status' | 'due' | 'created_at'
export type SortDirection = 'asc' | 'desc'
export type FeedbackFilter = {
  status: FeedbackStatus | 'all'
  search: string
  channel: FeedbackChannel | 'all'
  priority: FeedbackPriority | 'all'
  assignee: FeedbackAssigneeFilter
  due: FeedbackDueFilter
  due_from: string
  due_to: string
}
export type InboxQuery = FeedbackFilter & {
  page: number
  sort: InboxSortField
  direction: SortDirection
}
export type FeedbackExportQuery = FeedbackFilter & {
  ids: number[]
  sort: InboxSortField
  direction: SortDirection
}
export type MetricsQuery = { from: string; to: string }
export type LoginInput = { email: string; password: string }
export type AssignmentInput = {
  assignee_id: number | null
  priority: FeedbackPriority
  due_at: string | null
}
export type NoteInput = { body: string; is_private: boolean }
export type SummaryInput = { id: number }

export type ApiError = { error: string }
export type LoginResponse = { token: string; user: User }
export type InboxResponse = { items: FeedbackItem[]; total: number; page: number }
export type UsersResponse = { users: User[] }
export type NotesResponse = { notes: InternalNote[] }
export type SummaryResponse = { summary: string }
