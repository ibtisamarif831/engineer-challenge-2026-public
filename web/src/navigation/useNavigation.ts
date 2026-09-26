import { useEffect, useState, type MouseEvent } from 'react'

export type Route = {
  page: number
  filter: string
  search: string
  ticketId: number | null
  invalid: boolean
  returnTicket: number | null
}

function readRoute(): Route {
  const url = new URL(window.location.href)
  const match = /^\/tickets\/([1-9]\d*)\/?$/.exec(url.pathname)
  const id = match ? Number(match[1]) : null
  const rawPage = url.searchParams.get('page') || '1'
  const page = /^[1-9]\d*$/.test(rawPage) ? Number(rawPage) : 1
  const status = url.searchParams.get('status') || 'all'
  const state: unknown = window.history.state
  const origin = state && typeof state === 'object' && 'pulseReturnTicket' in state ? state.pulseReturnTicket : null
  return {
    returnTicket: typeof origin === 'number' && Number.isSafeInteger(origin) && origin > 0 ? origin : null,
    page: Number.isSafeInteger(page) ? page : 1,
    filter: ['all', 'open', 'resolved'].includes(status) ? status : 'all',
    search: url.searchParams.get('q') || '',
    ticketId: id !== null && Number.isSafeInteger(id) ? id : null,
    invalid: url.pathname !== '/' && (!match || !Number.isSafeInteger(id)),
  }
}

export function routeHref(route: Route): string {
  const query = new URLSearchParams()
  if (route.page !== 1) query.set('page', String(route.page))
  if (route.filter !== 'all') query.set('status', route.filter)
  if (route.search) query.set('q', route.search)
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
