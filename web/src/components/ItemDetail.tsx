import { useEffect, useState } from 'react'
import {
  addNote,
  fetchItem,
  fetchNotes,
  summarize,
  toggleResolve,
  updateAssignment,
} from '../api/feedback'
import { fetchCustomer } from '../api/customers'
import { fetchUsers } from '../api/users'
import { CustomerProfile, FeedbackItem, InternalNote, User } from '../types'
import AssignmentFields from './detail/AssignmentFields'
import CustomerPanel from './detail/CustomerPanel'
import NotesPanel from './detail/NotesPanel'
import { ChannelBadge, PriorityBadge, StatusBadge } from './feedback/FeedbackBadges'
import Button from './ui/Button'
import ErrorNotice from './ui/ErrorNotice'
import { requestErrorMessage } from '../api/errors'

export default function ItemDetail({
  id,
  token,
  onBack,
}: {
  id: number
  token: string
  onBack: () => void
}) {
  const [item, setItem] = useState<FeedbackItem | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [customer, setCustomer] = useState<CustomerProfile | null>(null)
  const [notes, setNotes] = useState<InternalNote[]>([])
  const [summary, setSummary] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [priority, setPriority] = useState<FeedbackItem['priority']>('normal')
  const [dueAt, setDueAt] = useState('')
  const [noteBody, setNoteBody] = useState('')
  const [privateNote, setPrivateNote] = useState(true)
  const [assignmentError, setAssignmentError] = useState('')
  const [noteError, setNoteError] = useState('')

  const [loadError, setLoadError] = useState('')
  const [relatedError, setRelatedError] = useState('')
  const [actionError, setActionError] = useState('')
  const [reload, setReload] = useState(0)
  const [relatedReload, setRelatedReload] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const data = await fetchItem(id, token)
      if (cancelled) return

      setItem(data)
      setAssigneeId(data.assignee_id ? String(data.assignee_id) : '')
      setPriority(data.priority)
      setDueAt(data.due_at ? data.due_at.slice(0, 10) : '')

    }

    setLoadError('')
    load().catch((error: unknown) => {
      if (!cancelled) setLoadError(requestErrorMessage(error, 'Unable to load this ticket. Please try again.'))
    })

    return () => { cancelled = true }
  }, [id, token, reload])

  const customerId = item?.customer_id
  useEffect(() => {
    if (customerId === undefined) return
    let cancelled = false
    setRelatedError('')
    Promise.all([
      fetchUsers(token), fetchCustomer(customerId, token), fetchNotes(id, token),
    ]).then(([userData, profile, noteData]) => {
      if (cancelled) return
      setUsers(userData.users)
      setCustomer(profile)
      setNotes(noteData.notes)
    }).catch((error: unknown) => {
      if (!cancelled) setRelatedError(requestErrorMessage(error, 'Unable to load assignment options, customer details or notes. Please try again.'))
    })
    return () => { cancelled = true }
  }, [id, token, customerId, relatedReload])

  const onResolve = async () => {
    if (!item) return
    setActionError('')
    try {
      const updated = await toggleResolve(item.id, token)
      setItem((current) => current ? { ...current, status: updated.status } : current)
    } catch (error) {
      setActionError(requestErrorMessage(error, 'Unable to update status. Check the ticket status before trying again.'))
    }
  }

  const onSummarize = async () => {
    setActionError('')
    try {
      const data = await summarize(id, token)
      setSummary(data.summary)
    } catch (error) {
      setActionError(requestErrorMessage(error, 'Unable to create a summary. Please try again.'))
    }
  }

  const onSaveAssignment = async () => {
    if (!item) return
    setAssignmentError('')
    try {
      const updated = await updateAssignment(
        item.id,
        {
          assignee_id: assigneeId ? Number(assigneeId) : null,
          priority,
          due_at: dueAt,
        },
        token
      )
      setItem(updated)
    } catch (error) {
      setAssignmentError(requestErrorMessage(error, 'Unable to save assignment. Your changes are kept; please try again.'))
    }
  }

  const onAddNote = async () => {
    if (!noteBody.trim()) return
    setNoteError('')
    try {
      const note = await addNote(id, { body: noteBody, is_private: privateNote }, token)
      setNotes((current) => [note, ...current])
      setNoteBody('')
    } catch (error) {
      setNoteError(requestErrorMessage(error, 'Unable to add note. Your draft is kept; please try again.'))
    }
  }

  if (!item) {
    return (
      <div className="detail">
        <Button variant="quiet" className="back-button" onClick={onBack}>
          ← Back to inbox
        </Button>
        <ErrorNotice message={loadError} onRetry={() => setReload((value) => value + 1)} />
        {!loadError && <p role="status">Loading ticket…</p>}
      </div>
    )
  }

  return (
    <div className="detail">
      <Button variant="quiet" className="back-button" onClick={onBack}>
        ← Back to inbox
      </Button>
      <ErrorNotice message={relatedError} onRetry={() => setRelatedReload((value) => value + 1)} />
      <div className="detail-grid">
        <div className="detail-card panel">
          <div className="detail-head">
            <div>
              <h1>{item.customer_name}</h1>
              <div className="muted">{item.customer_email}</div>
            </div>
            <StatusBadge status={item.status} />
          </div>
          <div className="detail-meta">
            <ChannelBadge channel={item.channel} />
            <PriorityBadge priority={item.priority} />
            <time className="muted" dateTime={item.created_at}>{new Date(item.created_at).toLocaleString()}</time>
          </div>
          <div className="message feedback-text">{item.message}</div>
          <AssignmentFields
            users={users}
            assigneeId={assigneeId}
            priority={priority}
            dueAt={dueAt}
            onAssigneeChange={setAssigneeId}
            onPriorityChange={setPriority}
            onDueDateChange={setDueAt}
            onSave={onSaveAssignment}
            error={assignmentError}
          />
          <div className="detail-actions">
            <Button variant="primary" onClick={onResolve}>
              {item.status === 'open' ? 'Mark resolved' : 'Reopen'}
            </Button>
            <Button onClick={onSummarize}>
              Summarize
            </Button>
          </div>
          <ErrorNotice message={actionError} />
          {summary && (
            <div className="summary">
              <h2>Summary</h2>
              <div className="feedback-text">{summary}</div>
            </div>
          )}
        </div>

        <aside className="side-panels">
          {customer && <CustomerPanel customer={customer} />}

          <NotesPanel
            notes={notes}
            noteBody={noteBody}
            privateNote={privateNote}
            onBodyChange={setNoteBody}
            onPrivateChange={setPrivateNote}
            onAdd={onAddNote}
            error={noteError}
          />
        </aside>
      </div>
    </div>
  )
}
