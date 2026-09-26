import type { FeedbackItem } from '../../types'

export function StatusBadge({ status }: { status: FeedbackItem['status'] }) {
  return <span className={'badge ' + status}>{status}</span>
}

export function PriorityBadge({ priority }: { priority: FeedbackItem['priority'] }) {
  return <span className={'priority ' + priority}>{priority}</span>
}

export function ChannelBadge({ channel }: { channel: FeedbackItem['channel'] }) {
  return <span className="channel">{channel}</span>
}
