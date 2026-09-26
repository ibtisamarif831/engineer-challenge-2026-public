import type { Metrics } from '../../types'

export default function MetricsStrip({ metrics }: { metrics: Metrics }) {
  return (
    <div className="metrics-strip panel">
      <div><strong>{metrics.open}</strong><span>Open</span></div>
      <div><strong>{metrics.resolved}</strong><span>Resolved</span></div>
      <div><strong>{metrics.urgent}</strong><span>Urgent</span></div>
      <div><strong>{metrics.overdue}</strong><span>Overdue</span></div>
    </div>
  )
}
