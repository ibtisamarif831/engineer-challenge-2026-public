import { useEffect, useRef, useState } from 'react'
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
import { draftSession, draftsPersisted, readDraft, useTicketDraft, writeDraft, type TicketDraft } from '../navigation/drafts'
import Button from './ui/Button'
import ErrorNotice from './ui/ErrorNotice'
import { requestErrorMessage } from '../api/errors'

export default function ItemDetail({
  id,
  token,
  onBack,
  onOpen,
  ticketHref,
}: {
  id: number
  token: string
  onBack: () => void
  onOpen: (id: number) => void
  ticketHref: (id: number) => string
}) {
  const [item, setItem] = useState<FeedbackItem | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [customer, setCustomer] = useState<CustomerProfile | null>(null)
  const [notes, setNotes] = useState<InternalNote[]>([])
  const [summary, setSummary] = useState('')
  const draft = useTicketDraft(id)
  const savedAssignment = {
    assigneeId: item?.assignee_id ? String(item.assignee_id) : '',
    priority: item?.priority || 'normal',
    dueAt: item?.due_at?.slice(0, 10) || '',
  }
  const assignment = draft.assignment || savedAssignment
  const { assigneeId, priority, dueAt } = assignment
  const noteBody = draft.note?.body || ''
  const privateNote = draft.note?.private ?? true
  const changeAssignment = (change: Partial<NonNullable<TicketDraft['assignment']>>) => {
    const next = { ...assignment, ...change }
    const unchanged = next.assigneeId === savedAssignment.assigneeId && next.priority === savedAssignment.priority && next.dueAt === savedAssignment.dueAt
    writeDraft(id, { ...readDraft(id), assignment: unchanged ? undefined : next })
  }
  const changeNote = (body: string, isPrivate: boolean) => {
    writeDraft(id, { ...readDraft(id), note: body ? { body, private: isPrivate } : undefined })
  }
  const headingRef = useRef<HTMLHeadingElement>(null)
  const focused = useRef(false)
  const pending = useRef(new Set<string>())
  const [savingAssignment, setSavingAssignment] = useState(false)
  const [savingNote, setSavingNote] = useState(false)
  useEffect(() => {
    document.title = `Ticket #${id}${item ? ` · ${item.customer_name}` : ''} · Pulse`
    if (!focused.current && (item || loadError)) {
      headingRef.current?.focus()
      focused.current = true
    }
  })
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

    }

    setLoadError('')
    load().catch((error: unknown) => {
      if (!cancelled) setLoadError(requestErrorMessage(error, 'Unable to load this ticket. Please try again.'))
    })

    return () => { cancelled = true }
  }, [id, token, reload])

  useEffect(() => {
    const onSaved = (event: Event) => {
      if ((event as CustomEvent<number>).detail !== id) return
      setReload((value) => value + 1)
      setRelatedReload((value) => value + 1)
    }
    window.addEventListener('pulse:ticket-saved', onSaved)
    return () => window.removeEventListener('pulse:ticket-saved', onSaved)
  }, [id])

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
    if (!item || pending.current.has('assignment')) return
    pending.current.add('assignment')
    setSavingAssignment(true)
    const session = draftSession()
    const submitted = readDraft(id).assignment
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
      if (session === draftSession() && readDraft(id).assignment === submitted) {
        writeDraft(id, { ...readDraft(id), assignment: undefined })
      }
      if (session === draftSession()) window.dispatchEvent(new CustomEvent('pulse:ticket-saved', { detail: id }))
    } catch (error) {
      setAssignmentError(requestErrorMessage(error, 'Unable to save assignment. Your changes are kept; please try again.'))
    } finally {
      pending.current.delete('assignment')
      setSavingAssignment(false)
    }
  }

  const onAddNote = async () => {
    if (!noteBody.trim() || pending.current.has('note')) return
    pending.current.add('note')
    setSavingNote(true)
    const session = draftSession()
    const submitted = readDraft(id).note
    setNoteError('')
    try {
      const note = await addNote(id, { body: noteBody, is_private: privateNote }, token)
      setNotes((current) => [note, ...current])
      if (session === draftSession() && readDraft(id).note === submitted) {
        writeDraft(id, { ...readDraft(id), note: undefined })
      }
      if (session === draftSession()) window.dispatchEvent(new CustomEvent('pulse:ticket-saved', { detail: id }))
    } catch (error) {
      setNoteError(requestErrorMessage(error, 'Unable to add note. Your draft is kept; please try again.'))
    } finally {
      pending.current.delete('note')
      setSavingNote(false)
    }
  }

  if (!item) {
    return (
      <div className="detail">
        <Button variant="quiet" className="back-button" onClick={onBack}>
          ← Back to inbox
        </Button>
        <h1 ref={headingRef} tabIndex={-1}>Ticket #{id}</h1>
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
      {(draft.assignment || draft.note?.body) && <div className="panel draft-notice" role="status">
        <p>{draftsPersisted() ? 'Unsaved draft. Kept in this tab when you navigate or refresh; discarded on confirmed sign-out.' : 'Unsaved draft. Browser storage is unavailable. Keep this tab open or copy your changes before refreshing.'}</p>
        <Button onClick={() => { if (window.confirm('Discard unsaved changes for this ticket?')) writeDraft(id, {}) }}>Discard draft</Button>
      </div>}
      <ErrorNotice message={relatedError} onRetry={() => setRelatedReload((value) => value + 1)} />
      <div className="detail-grid">
        <div className="detail-card panel">
          <div className="detail-head">
            <div>
              <h1 ref={headingRef} tabIndex={-1}>{item.customer_name} · #{id}</h1>
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
            onAssigneeChange={(value) => changeAssignment({ assigneeId: value })}
            onPriorityChange={(value) => changeAssignment({ priority: value })}
            onDueDateChange={(value) => changeAssignment({ dueAt: value })}
            onSave={onSaveAssignment}
            error={assignmentError}
            saving={savingAssignment}
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
          {customer && <CustomerPanel customer={customer} onOpen={onOpen} ticketHref={ticketHref} />}

          <NotesPanel
            notes={notes}
            noteBody={noteBody}
            privateNote={privateNote}
            onBodyChange={(value) => changeNote(value, privateNote)}
            onPrivateChange={(value) => changeNote(noteBody, value)}
            onAdd={onAddNote}
            error={noteError}
            saving={savingNote}
          />
        </aside>
      </div>
    </div>
  )
}
