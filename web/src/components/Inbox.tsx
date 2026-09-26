import { useEffect, useRef, useState } from 'react'
import { exportFeedback, fetchInbox, toggleResolve } from '../api/feedback'
import { fetchMetrics } from '../api/metrics'
import { fetchUsers } from '../api/users'
import type {
  FeedbackAssigneeFilter, FeedbackChannel, FeedbackDueFilter, FeedbackExportQuery, FeedbackItem,
  FeedbackPriority, FeedbackStatus, InboxQuery, InboxSortField, Metrics, SortDirection, User,
} from '../types'
import ItemDetail from './ItemDetail'
import FeedbackTable from './inbox/FeedbackTable'
import InboxToolbar from './inbox/InboxToolbar'
import MetricsStrip from './inbox/MetricsStrip'
import Pagination from './ui/Pagination'
import ErrorNotice from './ui/ErrorNotice'
import { requestErrorMessage } from '../api/errors'
import { routeHref, useNavigation, type Route } from '../navigation/useNavigation'
import Loader from './ui/Loader'
import { draftSession } from '../navigation/drafts'

const PAGE_SIZE = 10

function inboxQuery(route: Route): InboxQuery {
  return {
    page: route.page,
    status: route.status,
    search: route.search,
    channel: route.channel,
    priority: route.priority,
    assignee: route.assignee,
    due: route.due,
    due_from: route.dueFrom,
    due_to: route.dueTo,
    sort: route.sort,
    direction: route.direction,
  }
}

type SortableField = Exclude<InboxSortField, 'created_at'>

export default function Inbox({ token }: { token: string }) {
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [total, setTotal] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [users, setUsers] = useState<User[]>([])
  const { route, navigate } = useNavigation()
  const {
    page, status, search, channel, priority, assignee, due, dueFrom, dueTo, sort, direction,
    ticketId: selectedId,
  } = route
  const headingRef = useRef<HTMLHeadingElement>(null)
  const returnTicket = useRef<number | null>(route.returnTicket || selectedId)
  const restoreFocus = useRef(false)
  const previousTicket = useRef(selectedId)
  const previousInvalid = useRef(route.invalid)
  const loadPending = useRef(true)
  const requestVersion = useRef(0)
  const metricsVersion = useRef(0)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [exportError, setExportError] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const [loadError, setLoadError] = useState('')
  const [usersError, setUsersError] = useState('')
  const [metricsError, setMetricsError] = useState('')
  const [actionError, setActionError] = useState('')
  const [reload, setReload] = useState(0)
  const [metricsReload, setMetricsReload] = useState(0)
  const [loading, setLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [resolvingId, setResolvingId] = useState<number | null>(null)

  useEffect(() => {
    const onSaved = () => {
      // Invalidate reads immediately, before the refresh effects run.
      requestVersion.current += 1
      metricsVersion.current += 1
      setReload((value) => value + 1)
      setMetricsReload((value) => value + 1)
    }
    window.addEventListener('pulse:ticket-saved', onSaved)
    return () => window.removeEventListener('pulse:ticket-saved', onSaved)
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchUsers(token).then((data) => {
      if (!cancelled) {
        setUsers(data.users)
        setUsersError('')
      }
    }).catch((error: unknown) => {
      if (!cancelled) setUsersError(requestErrorMessage(error, 'Unable to load owner options.'))
    })
    return () => { cancelled = true }
  }, [token])

  useEffect(() => {
    if (selectedId !== null || route.invalid) return
    let cancelled = false
    const query = inboxQuery(route)
    const load = async (foreground = true) => {
      const currentRequest = ++requestVersion.current
      setLoadError('')
      loadPending.current = true
      if (foreground) setLoading(true)
      try {
        const data = await fetchInbox(query, token)
        if (!cancelled && currentRequest === requestVersion.current) {
          const lastPage = Math.max(1, Math.ceil(data.total / PAGE_SIZE))
          if (page > lastPage) {
            navigate({ ...route, page: lastPage }, true)
            return
          }
          setItems(data.items)
          setTotal(data.total)
          setSelectedIds((current) => {
            const visible = new Set(data.items.map((item) => item.id))
            const next = new Set([...current].filter((id) => visible.has(id)))
            return next.size === current.size ? current : next
          })
          setHasLoaded(true)
        }
      } catch (error) {
        if (!cancelled && currentRequest === requestVersion.current) {
          setLoadError(requestErrorMessage(error, 'Unable to load feedback. Please try again.'))
        }
      } finally {
        if (!cancelled && currentRequest === requestVersion.current) {
          loadPending.current = false
          setLoading(false)
        }
      }
    }
    void load()
    const interval = setInterval(() => { void load(false) }, 45000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [page, status, search, channel, priority, assignee, due, dueFrom, dueTo, sort, direction, token, reload, selectedId, route.invalid])

  useEffect(() => {
    let cancelled = false
    const currentRequest = ++metricsVersion.current
    setMetricsError('')
    fetchMetrics(token).then((data) => {
      if (!cancelled && currentRequest === metricsVersion.current) setMetrics(data)
    }).catch((error: unknown) => {
      if (!cancelled && currentRequest === metricsVersion.current) setMetricsError(requestErrorMessage(error, 'Unable to refresh metrics. Displayed counts may be out of date.'))
    })
    return () => { cancelled = true }
  }, [token, metricsReload])

  useEffect(() => {
    setSelectedIds(new Set())
  }, [page, status, search, channel, priority, assignee, due, dueFrom, dueTo, sort, direction])

  const updateQuery = (change: Partial<Route>, replace = false) => {
    setSelectedIds(new Set())
    navigate({ ...route, ...change, page: 1 }, replace)
  }

  const onResolve = async (item: FeedbackItem) => {
    if (resolvingId !== null) return
    setActionError('')
    setResolvingId(item.id)
    const session = draftSession()
    try {
      await toggleResolve(item.id, token)
      if (session === draftSession()) window.dispatchEvent(new CustomEvent('pulse:ticket-saved', { detail: item.id }))
    } catch (error) {
      setActionError(requestErrorMessage(error, 'Unable to update ticket status. Refresh to check its current status before trying again.'))
    } finally {
      setResolvingId(null)
    }
  }

  const onToggleSelection = (id: number) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const onToggleAll = () => {
    setSelectedIds((current) => {
      const allSelected = items.length > 0 && items.every((item) => current.has(item.id))
      const next = new Set(current)
      items.forEach((item) => {
        if (allSelected) next.delete(item.id)
        else next.add(item.id)
      })
      return next
    })
  }

  const onSortChange = (field: SortableField) => {
    const reset = route.sort === field && route.direction === 'desc'
    const nextDirection: SortDirection = route.sort === field && route.direction === 'asc' ? 'desc' : 'asc'
    setSelectedIds(new Set())
    navigate({ ...route, sort: reset ? 'created_at' : field, direction: reset ? 'desc' : nextDirection, page: 1 })
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const onExport = async () => {
    setExportError('')
    setIsExporting(true)
    try {
      const { page: _page, ...currentQuery } = inboxQuery(route)
      const query: FeedbackExportQuery = { ...currentQuery, ids: [...selectedIds] }
      const blob = await exportFeedback(query, token)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      try {
        link.href = url
        link.download = 'pulse-feedback-export.csv'
        document.body.appendChild(link)
        link.click()
      } finally {
        link.remove()
        // Allow the browser to start the download before releasing its Blob URL.
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      }
    } catch (error) {
      setExportError(requestErrorMessage(error, 'Unable to export feedback. Please try again.'))
    } finally {
      setIsExporting(false)
    }
  }

  const ticketHref = (id: number) => routeHref({ ...route, ticketId: id, invalid: false })
  const openTicket = (id: number) => {
    if (selectedId === null) returnTicket.current = id
    navigate({ ...route, ticketId: id, invalid: false, returnTicket: selectedId === null ? id : route.returnTicket || selectedId })
  }
  const backToInbox = () => navigate({ ...route, ticketId: null, invalid: false })

  useEffect(() => {
    if ((previousTicket.current !== null || previousInvalid.current) && selectedId === null && !route.invalid) restoreFocus.current = true
    previousInvalid.current = route.invalid
    if (route.invalid) headingRef.current?.focus()
    previousTicket.current = selectedId
    if (selectedId !== null) returnTicket.current = route.returnTicket || selectedId
    if (selectedId === null) document.title = route.invalid ? 'Page not found · Pulse' : `Inbox · Page ${page} · Pulse`
  }, [selectedId, page, route.invalid, route.returnTicket])

  useEffect(() => {
    if (selectedId !== null || loading || loadPending.current || !restoreFocus.current) return
    restoreFocus.current = false
    const target = returnTicket.current === null ? null : document.getElementById(`ticket-link-${returnTicket.current}`)
    const focusTarget = target || headingRef.current
    focusTarget?.focus()
  }, [selectedId, loading, items, loadError])

  if (route.invalid) {
    return <section className="panel empty-state"><h1 ref={headingRef} tabIndex={-1}>Page not found</h1><p>This ticket URL is invalid.</p><button className="button" onClick={backToInbox}>Return to inbox</button></section>
  }

  if (selectedId !== null) {
    return (
      <ItemDetail
        key={selectedId}
        id={selectedId}
        token={token}
        onBack={backToInbox}
        onOpen={openTicket}
        ticketHref={ticketHref}
      />
    )
  }

  return (
    <div className="inbox">
      <div className="page-heading">
        <h1 ref={headingRef} tabIndex={-1}>Inbox</h1>
        <span className="muted">Customer feedback</span>
      </div>
      <ErrorNotice message={metricsError} onRetry={() => setMetricsReload((value) => value + 1)} />
      {metrics && <MetricsStrip metrics={metrics} />}
      <section className="panel" aria-label="Feedback inbox">
        <InboxToolbar
          status={status}
          channel={channel}
          priority={priority}
          assignee={assignee}
          due={due}
          dueFrom={dueFrom}
          dueTo={dueTo}
          search={search}
          users={users}
          usersError={usersError}
          selectedCount={selectedIds.size}
          onStatusChange={(value) => updateQuery({ status: value })}
          onChannelChange={(value) => updateQuery({ channel: value })}
          onPriorityChange={(value) => updateQuery({ priority: value })}
          onAssigneeChange={(value) => updateQuery({ assignee: value })}
          onDueChange={(value) => updateQuery({ due: value })}
          onDueFromChange={(value) => updateQuery({ dueFrom: value })}
          onDueToChange={(value) => updateQuery({ dueTo: value })}
          onResetFilters={() => updateQuery({
            status: 'all',
            channel: 'all',
            priority: 'all',
            assignee: 'all',
            due: 'all',
            dueFrom: '',
            dueTo: '',
          })}
          onSearchChange={(value) => updateQuery({ search: value }, true)}
          onExport={onExport}
          isExporting={isExporting}
        />
        {exportError && <div className="error" role="alert">{exportError}</div>}
        <ErrorNotice message={loadError} onRetry={() => setReload((value) => value + 1)} />
        <ErrorNotice message={actionError} onRetry={() => { setActionError(''); setReload((value) => value + 1) }} />
        {loading && <Loader label={hasLoaded ? 'Refreshing feedback…' : 'Loading feedback…'} />}
        {!loading && !loadError && (
          <FeedbackTable
            items={items}
            onOpen={openTicket}
            ticketHref={ticketHref}
            onResolve={onResolve}
            resolvingId={resolvingId}
            sort={sort}
            direction={direction}
            onSortChange={onSortChange}
            selectedIds={selectedIds}
            onToggleSelection={onToggleSelection}
            onToggleAll={onToggleAll}
          />
        )}
      </section>
      <Pagination page={page} totalPages={totalPages} onPageChange={(value) => {
        setSelectedIds(new Set())
        navigate({ ...route, page: value })
      }} label="Inbox pagination" />
    </div>
  )
}
