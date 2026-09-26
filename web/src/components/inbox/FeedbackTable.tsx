import { useEffect, useRef } from 'react'
import { isPlainClick } from '../../navigation/useNavigation'
import type { FeedbackItem, InboxSortField, SortDirection } from '../../types'
import Button from '../ui/Button'
import { ChannelBadge, PriorityBadge, StatusBadge } from '../feedback/FeedbackBadges'
import MessageWithWarning, { containsUrl } from '../feedback/MessageWithWarning'

type SortableField = Exclude<InboxSortField, 'created_at'>

type FeedbackTableProps = {
  ticketHref: (id: number) => string
  items: FeedbackItem[]
  onOpen: (id: number) => void
  onResolve: (item: FeedbackItem) => void
  resolvingId: number | null
  sort: InboxSortField
  direction: SortDirection
  onSortChange: (field: SortableField) => void
  selectedIds: Set<number>
  onToggleSelection: (id: number) => void
  onToggleAll: () => void
}

function SortableHeader({
  field, label, sort, direction, onSortChange,
}: {
  field: SortableField
  label: string
  sort: InboxSortField
  direction: SortDirection
  onSortChange: (field: SortableField) => void
}) {
  const active = sort === field
  const nextAction = active && direction === 'desc'
    ? 'restore default order, newest first'
    : `sort ${active ? 'descending' : 'ascending'}`
  const ariaSort = active ? direction === 'asc' ? 'ascending' : 'descending' : 'none'
  return (
    <th scope="col" aria-sort={ariaSort}>
      <Button
        variant="plain"
        className="sort-button"
        aria-label={active ? `${label}, sorted ${ariaSort}; click to ${nextAction}` : `Sort by ${label} ascending`}
        onClick={() => onSortChange(field)}
      >
        <span>{label}</span>
        <span className="sort-icon" aria-hidden="true">{active ? direction === 'asc' ? '↑' : '↓' : '↕'}</span>
      </Button>
    </th>
  )
}

export default function FeedbackTable({
  items, onOpen, onResolve, ticketHref, resolvingId, sort, direction, onSortChange, selectedIds,
  onToggleSelection, onToggleAll,
}: FeedbackTableProps) {
  const selectAllRef = useRef<HTMLInputElement>(null)
  const selectedCount = items.filter((item) => selectedIds.has(item.id)).length
  const allSelected = items.length > 0 && selectedCount === items.length
  const partiallySelected = selectedCount > 0 && !allSelected

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = partiallySelected
  }, [partiallySelected])

  return (
    <>
      <div className="table-scroll" role="region" aria-label="Feedback tickets, scroll horizontally for all columns" tabIndex={0}>
        <table className="feedback-table">
          <caption className="sr-only">Customer feedback tickets</caption>
          <thead>
            <tr>
              <th scope="col" className="selection-column">
                <input
                  ref={selectAllRef}
                  className="table-checkbox"
                  type="checkbox"
                  checked={allSelected}
                  disabled={items.length === 0}
                  aria-label={allSelected ? 'Clear all visible ticket selections' : 'Select all visible tickets'}
                  onClick={(event) => event.stopPropagation()}
                  onChange={onToggleAll}
                />
              </th>
              <SortableHeader field="customer" label="Customer" sort={sort} direction={direction} onSortChange={onSortChange} />
              <th scope="col">Channel</th>
              <SortableHeader field="priority" label="Priority" sort={sort} direction={direction} onSortChange={onSortChange} />
              <th scope="col">Message</th>
              <SortableHeader field="owner" label="Owner" sort={sort} direction={direction} onSortChange={onSortChange} />
              <SortableHeader field="status" label="Status" sort={sort} direction={direction} onSortChange={onSortChange} />
              <SortableHeader field="due" label="Due" sort={sort} direction={direction} onSortChange={onSortChange} />
              <th scope="col"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const selected = selectedIds.has(item.id)
              return (
                <tr key={item.id} className={`row${selected ? ' selected' : ''}`} onClick={() => onOpen(item.id)}>
                  <td className="selection-column">
                    <input
                      className="table-checkbox"
                      type="checkbox"
                      checked={selected}
                      aria-label={`Select ticket ${item.id} from ${item.customer_name}`}
                      onClick={(event) => event.stopPropagation()}
                      onChange={() => onToggleSelection(item.id)}
                    />
                  </td>
                  <td>
                    <a
                      id={`ticket-link-${item.id}`}
                      href={ticketHref(item.id)}
                      className="ticket-button"
                      aria-label={`Open ticket ${item.id} from ${item.customer_name}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isPlainClick(e)) {
                          e.preventDefault()
                          onOpen(item.id)
                        }
                      }}
                    >
                      {item.customer_name}
                    </a>
                  </td>
                  <td><ChannelBadge channel={item.channel} /></td>
                  <td><PriorityBadge priority={item.priority} /></td>
                  <td className="preview">
                    <MessageWithWarning
                      message={item.message.length > 70 ? `${item.message.slice(0, 70)}…` : item.message}
                      className="feedback-text"
                      warnIfUrl={containsUrl(item.message)}
                    />
                  </td>
                  <td>{item.assignee_name || 'Unassigned'}</td>
                  <td><StatusBadge status={item.status} /></td>
                  <td className="due">{item.due_at ? item.due_at.slice(0, 10) : 'No due date'}</td>
                  <td>
                    <Button
                      disabled={resolvingId === item.id}
                      variant="quiet"
                      className="row-action"
                      onClick={(e) => {
                        e.stopPropagation()
                        onResolve(item)
                      }}
                    >
                      {resolvingId === item.id ? 'Updating…' : item.status === 'open' ? 'Resolve' : 'Reopen'}
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {items.length === 0 && (
        <div className="empty-state" role="status">
          <p><strong>No feedback to display</strong></p>
          <p>Try another search or filter.</p>
        </div>
      )}
    </>
  )
}
