import { isPlainClick } from '../../navigation/useNavigation'
import type { CustomerProfile } from '../../types'
import { StatusBadge } from '../feedback/FeedbackBadges'
import MessageWithWarning, { containsUrl } from '../feedback/MessageWithWarning'

export default function CustomerPanel({ customer, onOpen, ticketHref }: { customer: CustomerProfile; onOpen: (id: number) => void; ticketHref: (id: number) => string }) {
  return (
    <section className="mini-panel panel customer-panel">
      <h2>Customer profile</h2>
      <div className="profile-row">
        <span>Plan</span>
        <strong>{customer.plan}</strong>
      </div>
      <div className="profile-row">
        <span>Health</span>
        <strong>{customer.health_score}</strong>
      </div>
      <h3>Recent history</h3>
      <p className="muted">Up to 8 recent tickets</p>
      <ul className="history-list">
        {customer.history.map((historyItem) => (
          <li key={historyItem.id}>
            <StatusBadge status={historyItem.status} />
            <a href={ticketHref(historyItem.id)} onClick={(event) => {
              if (isPlainClick(event)) { event.preventDefault(); onOpen(historyItem.id) }
            }}>
              <span>Ticket #{historyItem.id} · <time dateTime={historyItem.created_at}>{new Date(historyItem.created_at).toLocaleDateString()}</time></span>
              <MessageWithWarning
                message={historyPreview(historyItem.message)}
                className="feedback-text"
                warnIfUrl={containsUrl(historyItem.message)}
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

function historyPreview(message: string): string {
  // Read text from an inert document; never insert stored markup into the live DOM.
  const document = new DOMParser().parseFromString(message, 'text/html')
  document.querySelectorAll('script, style, noscript').forEach((node) => node.remove())
  const text = document.body.textContent?.replace(/\s+/g, ' ').trim() || 'No preview available'
  return text.length > 80 ? `${text.slice(0, 80).replace(/\s+\S*$/, '')}…` : text
}
