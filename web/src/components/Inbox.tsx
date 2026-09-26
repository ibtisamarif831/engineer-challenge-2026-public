import { useEffect, useState } from 'react'
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

const PAGE_SIZE = 10

export default function Inbox({ token }: { token: string }) {
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [exportError, setExportError] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const [loadError, setLoadError] = useState('')
  const [metricsError, setMetricsError] = useState('')
  const [actionError, setActionError] = useState('')
  const [reload, setReload] = useState(0)
  const [metricsReload, setMetricsReload] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoadError('')
      setLoading(true)
      try {
        const data = await fetchInbox(page, filter, search, token)
        if (!cancelled) {
          setItems(data.items)
          setTotal(data.total)
        }
      } catch (error) {
        if (!cancelled) setLoadError(requestErrorMessage(error, 'Unable to load feedback. Please try again.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    const interval = setInterval(load, 45000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [page, filter, search, token, reload])

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
    setActionError('')
    try {
      const updated = await toggleResolve(item.id, token)
      setItems((current) => current.map((it) => it.id === item.id ? updated : it))
    } catch (error) {
      setActionError(requestErrorMessage(error, 'Unable to update ticket status. Refresh to check its current status before trying again.'))
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

  if (selectedId !== null) {
    return (
      <ItemDetail
        id={selectedId}
        token={token}
        onBack={() => {
          setSelectedId(null)
          setReload((value) => value + 1)
        }}
      />
    )
  }

  return (
    <div className="inbox">
      <div className="page-heading">
        <h1>Inbox</h1>
        <span className="muted">Customer feedback</span>
      </div>
      <ErrorNotice message={metricsError} onRetry={() => setMetricsReload((value) => value + 1)} />
      {metrics && <MetricsStrip metrics={metrics} />}
      <section className="panel" aria-label="Feedback inbox">
        <InboxToolbar
          filter={filter}
          search={search}
          onFilterChange={(value) => {
            setFilter(value)
            setPage(1)
          }}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          onExport={onExport}
          isExporting={isExporting}
        />
        {exportError && <div className="error" role="alert">{exportError}</div>}
        <ErrorNotice message={loadError} onRetry={() => setReload((value) => value + 1)} />
        <ErrorNotice message={actionError} onRetry={() => { setActionError(''); setReload((value) => value + 1) }} />
        {loading && <p role="status">Loading feedback…</p>}
        {!loading && !loadError && <FeedbackTable items={items} onOpen={setSelectedId} onResolve={onResolve} />}
      </section>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} label="Inbox pagination" />
    </div>
  )
}
