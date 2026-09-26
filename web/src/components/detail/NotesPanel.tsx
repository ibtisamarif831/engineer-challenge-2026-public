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
}

export default function NotesPanel({ notes, noteBody, privateNote, onBodyChange, onPrivateChange, onAdd }: NotesPanelProps) {
  return (
    <section className="mini-panel panel notes-panel">
      <h2>Internal notes</h2>
      <Field label="Note" hideLabel>
        <Textarea
          value={noteBody}
          onChange={(e) => onBodyChange(e.target.value)}
          placeholder="Add context for your team…"
        />
      </Field>
      <Checkbox
        label="Private note"
        checked={privateNote}
        onChange={(e) => onPrivateChange(e.target.checked)}
      />
      <Button disabled={!noteBody.trim()} onClick={onAdd}>Add note</Button>
      <div className="notes-list">
        {notes.map((note) => (
          <article key={note.id} className="note">
            <div className="note-meta">
              <strong>{note.author_name}</strong>
              <span>{note.is_private ? 'Private' : 'Shared'}</span>
            </div>
            <div dangerouslySetInnerHTML={{ __html: note.body }} />
          </article>
        ))}
      </div>
    </section>
  )
}
