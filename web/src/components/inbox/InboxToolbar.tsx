import { useState } from 'react'
import type {
  FeedbackAssigneeFilter, FeedbackChannel, FeedbackDueFilter, FeedbackPriority, FeedbackStatus, User,
} from '../../types'
import Button from '../ui/Button'
import Field from '../ui/Field'
import Input from '../ui/Input'
import Select from '../ui/Select'

type InboxToolbarProps = {
  status: FeedbackStatus | 'all'
  channel: FeedbackChannel | 'all'
  priority: FeedbackPriority | 'all'
  assignee: FeedbackAssigneeFilter
  due: FeedbackDueFilter
  dueFrom: string
  dueTo: string
  search: string
  users: User[]
  usersError: string
  selectedCount: number
  onStatusChange: (value: FeedbackStatus | 'all') => void
  onChannelChange: (value: FeedbackChannel | 'all') => void
  onPriorityChange: (value: FeedbackPriority | 'all') => void
  onAssigneeChange: (value: FeedbackAssigneeFilter) => void
  onDueChange: (value: FeedbackDueFilter) => void
  onDueFromChange: (value: string) => void
  onDueToChange: (value: string) => void
  onResetFilters: () => void
  onSearchChange: (search: string) => void
  onExport: () => void
  isExporting: boolean
}

const channels: Array<FeedbackChannel | 'all'> = ['all', 'email', 'chat', 'app store']
const priorities: Array<FeedbackPriority | 'all'> = ['all', 'low', 'normal', 'high', 'urgent']

function title(value: string): string {
  return value === 'all' ? 'All' : value[0].toUpperCase() + value.slice(1)
}

export default function InboxToolbar({
  status, channel, priority, assignee, due, dueFrom, dueTo, search, users, usersError, selectedCount,
  onStatusChange, onChannelChange, onPriorityChange, onAssigneeChange, onDueChange, onDueFromChange,
  onDueToChange, onResetFilters, onSearchChange, onExport, isExporting,
}: InboxToolbarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const activeFilterCount = [
    status !== 'all', channel !== 'all', priority !== 'all', assignee !== 'all', due !== 'all', dueFrom !== '', dueTo !== '',
  ].filter(Boolean).length

  return (
    <div className="toolbar">
      <div className="toolbar-actions">
        <Button
          className="filter-toggle"
          aria-expanded={filtersOpen}
          aria-controls="inbox-filter-panel"
          onClick={() => setFiltersOpen((open) => !open)}
        >
          {filtersOpen ? 'Hide filters' : 'Show filters'}{activeFilterCount ? ` (${activeFilterCount})` : ''}
        </Button>
        <Button
          variant="quiet"
          className="reset-filters-button"
          disabled={activeFilterCount === 0}
          onClick={onResetFilters}
        >
          Reset filters
        </Button>
      </div>
      <Field label="Search customer or message" hideLabel className="search-field">
        <Input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search customer or message…"
        />
      </Field>
      <Button className="export-button" disabled={isExporting} onClick={onExport}>
        {isExporting ? 'Exporting…' : selectedCount ? `Export selected (${selectedCount})` : 'Export filtered CSV'}
      </Button>
      {filtersOpen && (
        <div id="inbox-filter-panel" className="filter-panel" role="region" aria-label="Inbox filters">
          <Field label="Status">
            <Select value={status} onChange={(e) => onStatusChange(e.target.value as FeedbackStatus | 'all')}>
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
            </Select>
          </Field>
          <Field label="Channel">
            <Select value={channel} onChange={(e) => onChannelChange(e.target.value as FeedbackChannel | 'all')}>
              {channels.map((value) => <option key={value} value={value}>{title(value)}</option>)}
            </Select>
          </Field>
          <Field label="Priority">
            <Select value={priority} onChange={(e) => onPriorityChange(e.target.value as FeedbackPriority | 'all')}>
              {priorities.map((value) => <option key={value} value={value}>{title(value)}</option>)}
            </Select>
          </Field>
          <Field label="Owner">
            <Select value={String(assignee)} onChange={(e) => {
              const value = e.target.value
              onAssigneeChange(value === 'all' || value === 'unassigned' ? value : Number(value))
            }}>
              <option value="all">All owners</option>
              <option value="unassigned">Unassigned</option>
              {users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
            </Select>
          </Field>
          <Field label="Due date">
            <Select value={due} onChange={(e) => onDueChange(e.target.value as FeedbackDueFilter)}>
              <option value="all">Any due date</option>
              <option value="has">Has due date</option>
              <option value="none">No due date</option>
              <option value="overdue">Overdue</option>
            </Select>
          </Field>
          <Field label="Due from">
            <Input type="date" value={dueFrom} onChange={(e) => onDueFromChange(e.target.value)} />
          </Field>
          <Field label="Due to">
            <Input type="date" value={dueTo} onChange={(e) => onDueToChange(e.target.value)} />
          </Field>
          {usersError && <p className="filter-panel-error" role="alert">{usersError} Owner filtering is limited to unassigned tickets.</p>}
        </div>
      )}
    </div>
  )
}
