import type { CustomerProfile } from '../../types'
import { StatusBadge } from '../feedback/FeedbackBadges'

export default function CustomerPanel({ customer }: { customer: CustomerProfile }) {
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
      <ul className="history-list">
        {customer.history.map((historyItem) => (
          <li key={historyItem.id}>
            <StatusBadge status={historyItem.status} />
            <span>{historyItem.message.slice(0, 48)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
