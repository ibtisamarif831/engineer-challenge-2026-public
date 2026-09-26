import { useEffect, useState } from 'react'
import { exportFeedbackUrl, fetchInbox, fetchMetrics, toggleResolve } from '../api'
import { FeedbackItem, Metrics } from '../types'
import ItemDetail from './ItemDetail'
import FeedbackTable from './inbox/FeedbackTable'
import InboxToolbar from './inbox/InboxToolbar'
import MetricsStrip from './inbox/MetricsStrip'
import Pagination from './ui/Pagination'

const PAGE_SIZE = 10

export default function Inbox({ token }: { token: string }) {
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const load = async () => {
    const data = await fetchInbox(page, filter, search, token)
    setItems(data.items)
    setTotal(data.total)
  }

  useEffect(() => {
    load()
  }, [page, filter, search])

  useEffect(() => {
    fetchMetrics(token).then(setMetrics)
  }, [token])

  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await fetchInbox(page, filter, search, token)
      const merged = data.items.map((incoming) => {
        const local = items.find((it) => it.id === incoming.id)
        return local ? { ...incoming, status: local.status } : incoming
      })
      setItems(merged)
    }, 45000)
    return () => clearInterval(interval)
  }, [])

  const onResolve = async (item: FeedbackItem) => {
    const nextStatus = item.status === 'open' ? 'resolved' : 'open'
    setItems(items.map((it) => (it.id === item.id ? { ...it, status: nextStatus } : it)))
    await toggleResolve(item.id, token)
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  if (selectedId !== null) {
    return (
      <ItemDetail
        id={selectedId}
        token={token}
        onBack={() => {
          setSelectedId(null)
          load()
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
          onExport={() => {
            window.location.href = exportFeedbackUrl(filter, search, token)
          }}
        />
        <FeedbackTable items={items} onOpen={setSelectedId} onResolve={onResolve} />
      </section>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} label="Inbox pagination" />
    </div>
  )
}
