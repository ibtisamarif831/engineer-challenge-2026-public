import type { InternalNote } from '../../types'
import Button from '../ui/Button'
import Checkbox from '../ui/Checkbox'
import Field from '../ui/Field'
import Textarea from '../ui/Textarea'

type NotesPanelProps = {
  notes: InternalNote[]
  noteBody: string
  privateNote: boolean
  onBodyChange: (value: string) => void
  onPrivateChange: (value: boolean) => void
  onAdd: () => void
  saving: boolean
  error: string
}

export default function NotesPanel({ notes, noteBody, privateNote, onBodyChange, onPrivateChange, onAdd, error, saving }: NotesPanelProps) {
  return (
    <section className="mini-panel panel notes-panel">
      <h2>Internal notes</h2>
      <Field label="Note" hideLabel>
        <Textarea
          value={noteBody}
          maxLength={10000}
          onChange={(e) => onBodyChange(e.target.value)}
          placeholder="Add context for your team…"
        />
      </Field>
      <Checkbox
        label="Private note"
        checked={privateNote}
        onChange={(e) => onPrivateChange(e.target.checked)}
      />
      <Button disabled={saving || !noteBody.trim()} onClick={onAdd}>{saving ? 'Saving…' : 'Add note'}</Button>
      {error && <div className="error" role="alert">{error}</div>}
      <div className="notes-list">
        {notes.map((note) => (
          <article key={note.id} className="note">
            <div className="note-meta">
              <strong>{note.author_name}</strong>
              <span>{note.is_private ? 'Private' : 'Shared'}</span>
            </div>
            <div className="feedback-text">{note.body}</div>
          </article>
        ))}
      </div>
    </section>
  )
}
