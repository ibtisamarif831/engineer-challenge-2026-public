import { useEffect, useRef, useState } from 'react'
import { exportFeedback, fetchInbox, toggleResolve } from '../api/feedback'
import { fetchMetrics } from '../api/metrics'
import { FeedbackItem, Metrics } from '../types'
import ItemDetail from './ItemDetail'
import FeedbackTable from './inbox/FeedbackTable'
import InboxToolbar from './inbox/InboxToolbar'
import MetricsStrip from './inbox/MetricsStrip'
import Pagination from './ui/Pagination'

import ErrorNotice from './ui/ErrorNotice'
import { requestErrorMessage } from '../api/errors'

import { routeHref, useNavigation } from '../navigation/useNavigation'
import Loader from './ui/Loader'

const PAGE_SIZE = 10

export default function Inbox({ token }: { token: string }) {
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [total, setTotal] = useState(0)
  const { route, navigate } = useNavigation()
  const { page, filter, search, ticketId: selectedId } = route
  const headingRef = useRef<HTMLHeadingElement>(null)
  const returnTicket = useRef<number | null>(route.returnTicket || selectedId)
  const restoreFocus = useRef(false)
  const previousTicket = useRef(selectedId)
  const previousInvalid = useRef(route.invalid)
  const loadPending = useRef(true)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [exportError, setExportError] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const [loadError, setLoadError] = useState('')
  const [metricsError, setMetricsError] = useState('')
  const [actionError, setActionError] = useState('')
  const [reload, setReload] = useState(0)
  const [metricsReload, setMetricsReload] = useState(0)
  const [loading, setLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [resolvingId, setResolvingId] = useState<number | null>(null)

  useEffect(() => {
    if (selectedId !== null || route.invalid) return
    let cancelled = false
    let requestId = 0
    const load = async (foreground = true) => {
      const currentRequest = ++requestId
      setLoadError('')
      loadPending.current = true
      if (foreground) setLoading(true)
      try {
        const data = await fetchInbox(page, filter, search, token)
        if (!cancelled && currentRequest === requestId) {
          setItems(data.items)
          setTotal(data.total)
          setHasLoaded(true)
        }
      } catch (error) {
        if (!cancelled && currentRequest === requestId) setLoadError(requestErrorMessage(error, 'Unable to load feedback. Please try again.'))
      } finally {
        if (!cancelled && currentRequest === requestId) {
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
  }, [page, filter, search, token, reload, selectedId, route.invalid])

  useEffect(() => {
    let cancelled = false
    setMetricsError('')
    fetchMetrics(token).then((data) => {
      if (!cancelled) setMetrics(data)
    }).catch((error: unknown) => {
      if (!cancelled) setMetricsError(requestErrorMessage(error, 'Unable to refresh metrics. Displayed counts may be out of date.'))
    })
    return () => { cancelled = true }
  }, [token, metricsReload])

  const onResolve = async (item: FeedbackItem) => {
    if (resolvingId !== null) return
    setActionError('')
    setResolvingId(item.id)
    try {
      const updated = await toggleResolve(item.id, token)
      setItems((current) => current.map((it) => it.id === item.id ? updated : it))
    } catch (error) {
      setActionError(requestErrorMessage(error, 'Unable to update ticket status. Refresh to check its current status before trying again.'))
    } finally {
      setResolvingId(null)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const onExport = async () => {
    setExportError('')
    setIsExporting(true)
    try {
      const blob = await exportFeedback(filter, search, token)
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
          filter={filter}
          search={search}
          onFilterChange={(value) => {
            navigate({ ...route, filter: value, page: 1 })
          }}
          onSearchChange={(value) => {
            navigate({ ...route, search: value, page: 1 }, true)
          }}
          onExport={onExport}
          isExporting={isExporting}
        />
        {exportError && <div className="error" role="alert">{exportError}</div>}
        <ErrorNotice message={loadError} onRetry={() => setReload((value) => value + 1)} />
        <ErrorNotice message={actionError} onRetry={() => { setActionError(''); setReload((value) => value + 1) }} />
        {loading && <Loader label={hasLoaded ? 'Refreshing feedback…' : 'Loading feedback…'} />}
        {!loading && !loadError && <FeedbackTable items={items} onOpen={openTicket} ticketHref={ticketHref} onResolve={onResolve} resolvingId={resolvingId} />}
      </section>
      <Pagination page={page} totalPages={totalPages} onPageChange={(value) => navigate({ ...route, page: value })} label="Inbox pagination" />
    </div>
  )
}
