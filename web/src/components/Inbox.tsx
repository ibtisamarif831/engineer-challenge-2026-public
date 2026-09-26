import { useEffect, useState } from 'react'
import { exportFeedbackUrl, fetchInbox, fetchMetrics, toggleResolve } from '../api'
import { FeedbackItem, Metrics } from '../types'
import ItemDetail from './ItemDetail'

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
      {metrics && (
        <div className="metrics-strip panel">
          <div>
            <strong>{metrics.open}</strong>
            <span>Open</span>
          </div>
          <div>
            <strong>{metrics.resolved}</strong>
            <span>Resolved</span>
          </div>
          <div>
            <strong>{metrics.urgent}</strong>
            <span>Urgent</span>
          </div>
          <div>
            <strong>{metrics.overdue}</strong>
            <span>Overdue</span>
          </div>
        </div>
      )}
      <section className="panel" aria-label="Feedback inbox">
        <div className="toolbar">
          <div className="filters" role="group" aria-label="Filter by status">
            {['all', 'open', 'resolved'].map((f) => (
              <button
                key={f}
                className={'button filter-button' + (filter === f ? ' active' : '')}
                aria-pressed={filter === f}
                onClick={() => {
                  setFilter(f)
                  setPage(1)
                }}
              >
                {f[0].toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <label className="search-field">
            <span className="sr-only">Search feedback</span>
            <input
              className="input"
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search feedback…"
            />
          </label>
          <button
            className="button export-button"
            onClick={() => {
              window.location.href = exportFeedbackUrl(filter, search, token)
            }}
          >
            Export CSV
          </button>
        </div>

        <div className="table-scroll" role="region" aria-label="Feedback tickets, scroll horizontally for all columns" tabIndex={0}>
          <table className="feedback-table">
            <caption className="sr-only">Customer feedback tickets</caption>
            <thead>
              <tr>
                <th scope="col">Customer</th>
                <th scope="col">Channel</th>
                <th scope="col">Priority</th>
                <th scope="col">Message</th>
                <th scope="col">Owner</th>
                <th scope="col">Status</th>
                <th scope="col">Due</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="row" onClick={() => setSelectedId(item.id)}>
                  <td>
                    <button
                      className="ticket-button"
                      aria-label={`Open ticket ${item.id} from ${item.customer_name}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedId(item.id)
                      }}
                    >
                      {item.customer_name}
                    </button>
                  </td>
                  <td>
                    <span className="channel">{item.channel}</span>
                  </td>
                  <td>
                    <span className={'priority ' + item.priority}>{item.priority}</span>
                  </td>
                  <td className="preview">
                    {item.message.slice(0, 70)}
                    {item.message.length > 70 ? '…' : ''}
                  </td>
                  <td>{item.assignee_name || 'Unassigned'}</td>
                  <td>
                    <span className={'badge ' + item.status}>{item.status}</span>
                  </td>
                  <td className="due">{item.due_at ? new Date(item.due_at).toLocaleDateString() : 'No due date'}</td>
                  <td>
                    <button
                      className="button button-quiet row-action"
                      onClick={(e) => {
                        e.stopPropagation()
                        onResolve(item)
                      }}
                    >
                      {item.status === 'open' ? 'Resolve' : 'Reopen'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {items.length === 0 && (
          <div className="empty-state" role="status">
            <p><strong>No feedback to display</strong></p>
            <p>Try another search or status filter.</p>
          </div>
        )}
      </section>

      <nav className="pager" aria-label="Inbox pagination">
        <button className="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button className="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </nav>
    </div>
  )
}
