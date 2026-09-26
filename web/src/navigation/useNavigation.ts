import { useEffect, useState, type MouseEvent } from 'react'
import type {
  FeedbackAssigneeFilter, FeedbackChannel, FeedbackDueFilter, FeedbackPriority, FeedbackStatus,
  InboxSortField, SortDirection,
} from '../types'

export type Route = {
  page: number
  status: FeedbackStatus | 'all'
  search: string
  channel: FeedbackChannel | 'all'
  priority: FeedbackPriority | 'all'
  assignee: FeedbackAssigneeFilter
  due: FeedbackDueFilter
  dueFrom: string
  dueTo: string
  sort: InboxSortField
  direction: SortDirection
  ticketId: number | null
  invalid: boolean
  returnTicket: number | null
}

const channels = ['all', 'email', 'chat', 'app store'] as const
const priorities = ['all', 'low', 'normal', 'high', 'urgent'] as const
const dueFilters = ['all', 'has', 'none', 'overdue'] as const
const sortFields = ['customer', 'priority', 'owner', 'status', 'due', 'created_at'] as const

function parseAssignee(value: string | null): FeedbackAssigneeFilter {
  if (!value || value === 'all') return 'all'
  if (value === 'unassigned') return 'unassigned'
  return /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value)) ? Number(value) : 'all'
}

function readRoute(): Route {
  const url = new URL(window.location.href)
  const match = /^\/tickets\/([1-9]\d*)\/?$/.exec(url.pathname)
  const id = match ? Number(match[1]) : null
  const rawPage = url.searchParams.get('page') || '1'
  const page = /^[1-9]\d*$/.test(rawPage) ? Number(rawPage) : 1
  const statusValue = url.searchParams.get('status') || 'all'
  const channelValue = url.searchParams.get('channel') || 'all'
  const priorityValue = url.searchParams.get('priority') || 'all'
  const dueValue = url.searchParams.get('due') || 'all'
  const sortValue = url.searchParams.get('sort') || 'created_at'
  const sort = sortFields.includes(sortValue as InboxSortField) ? sortValue as InboxSortField : 'created_at'
  const rawDirection = url.searchParams.get('direction')
  const direction = rawDirection === 'asc' || rawDirection === 'desc'
    ? rawDirection
    : sort === 'created_at' ? 'desc' : 'asc'
  const state: unknown = window.history.state
  const origin = state && typeof state === 'object' && 'pulseReturnTicket' in state ? state.pulseReturnTicket : null
  return {
    returnTicket: typeof origin === 'number' && Number.isSafeInteger(origin) && origin > 0 ? origin : null,
    page: Number.isSafeInteger(page) ? page : 1,
    status: ['all', 'open', 'resolved'].includes(statusValue) ? statusValue as FeedbackStatus | 'all' : 'all',
    search: url.searchParams.get('q') || '',
    channel: channels.includes(channelValue as FeedbackChannel | 'all') ? channelValue as FeedbackChannel | 'all' : 'all',
    priority: priorities.includes(priorityValue as FeedbackPriority | 'all') ? priorityValue as FeedbackPriority | 'all' : 'all',
    assignee: parseAssignee(url.searchParams.get('assignee')),
    due: dueFilters.includes(dueValue as FeedbackDueFilter) ? dueValue as FeedbackDueFilter : 'all',
    dueFrom: url.searchParams.get('due_from') || '',
    dueTo: url.searchParams.get('due_to') || '',
    sort,
    direction,
    ticketId: id !== null && Number.isSafeInteger(id) ? id : null,
    invalid: url.pathname !== '/' && (!match || !Number.isSafeInteger(id)),
  }
}

export function routeHref(route: Route): string {
  const query = new URLSearchParams()
  if (route.page !== 1) query.set('page', String(route.page))
  if (route.status !== 'all') query.set('status', route.status)
  if (route.search) query.set('q', route.search)
  if (route.channel !== 'all') query.set('channel', route.channel)
  if (route.priority !== 'all') query.set('priority', route.priority)
  if (route.assignee !== 'all') query.set('assignee', String(route.assignee))
  if (route.due !== 'all') query.set('due', route.due)
  if (route.dueFrom) query.set('due_from', route.dueFrom)
  if (route.dueTo) query.set('due_to', route.dueTo)
  if (route.sort !== 'created_at') {
    query.set('sort', route.sort)
    query.set('direction', route.direction)
  }
  return `${route.ticketId === null ? '/' : `/tickets/${route.ticketId}`}${query.size ? `?${query}` : ''}`
}

export function isPlainClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
}

export function useNavigation() {
  const [route, setRoute] = useState(readRoute)
  useEffect(() => {
    const onPopState = () => setRoute(readRoute())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])
  const navigate = (next: Route, replace = false) => {
    const href = routeHref(next)
    if (href !== window.location.pathname + window.location.search) {
      window.history[replace ? 'replaceState' : 'pushState']({ pulseReturnTicket: next.returnTicket }, '', href)
    }
    setRoute(readRoute())
  }
  return { route, navigate }
}
