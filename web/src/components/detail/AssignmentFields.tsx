import type { FeedbackPriority, User } from '../../types'
import Button from '../ui/Button'
import Field from '../ui/Field'
import Input from '../ui/Input'
import Select from '../ui/Select'

const priorities: FeedbackPriority[] = ['low', 'normal', 'high', 'urgent']

type AssignmentFieldsProps = {
  users: User[]
  assigneeId: string
  priority: FeedbackPriority
  dueAt: string
  onAssigneeChange: (value: string) => void
  onPriorityChange: (value: FeedbackPriority) => void
  onDueDateChange: (value: string) => void
  onSave: () => void
  error: string
}

export default function AssignmentFields({
  users, assigneeId, priority, dueAt, onAssigneeChange, onPriorityChange, onDueDateChange, onSave, error,
}: AssignmentFieldsProps) {
  return (
    <section className="assignment-section" aria-labelledby="assignment-heading">
      <h2 id="assignment-heading">Assignment</h2>
      <div className="assignment-panel">
        <Field label="Owner">
          <Select value={assigneeId} onChange={(e) => onAssigneeChange(e.target.value)}>
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role})
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Priority">
          <Select value={priority} onChange={(e) => {
            const value = priorities.find((priority) => priority === e.target.value)
            if (value) onPriorityChange(value)
          }}>
            {priorities.map((p) => (
              <option key={p} value={p}>
                {p[0].toUpperCase() + p.slice(1)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Due date">
          <Input type="date" value={dueAt} onChange={(e) => onDueDateChange(e.target.value)} />
        </Field>
        <Button onClick={onSave}>Save assignment</Button>
      </div>
      {error && <div className="error" role="alert">{error}</div>}
    </section>
  )
}
