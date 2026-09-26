import { isPlainClick } from '../../navigation/useNavigation'
import type { FeedbackItem } from '../../types'
import Button from '../ui/Button'
import { ChannelBadge, PriorityBadge, StatusBadge } from '../feedback/FeedbackBadges'

type FeedbackTableProps = {
  ticketHref: (id: number) => string
  items: FeedbackItem[]
  onOpen: (id: number) => void
  onResolve: (item: FeedbackItem) => void
  resolvingId: number | null
}

export default function FeedbackTable({ items, onOpen, onResolve, ticketHref, resolvingId }: FeedbackTableProps) {
  return (
    <>
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
              <tr key={item.id} className="row" onClick={() => onOpen(item.id)}>
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
                <td>
                  <ChannelBadge channel={item.channel} />
                </td>
                <td>
                  <PriorityBadge priority={item.priority} />
                </td>
                <td className="preview">
                  {item.message.slice(0, 70)}
                  {item.message.length > 70 ? '…' : ''}
                </td>
                <td>{item.assignee_name || 'Unassigned'}</td>
                <td>
                  <StatusBadge status={item.status} />
                </td>
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
    </>
  )
}
