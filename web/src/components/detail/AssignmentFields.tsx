import type { User } from '../../types'
import Button from '../ui/Button'
import Field from '../ui/Field'
import Input from '../ui/Input'
import Select from '../ui/Select'

type AssignmentFieldsProps = {
  users: User[]
  assigneeId: string
  priority: string
  dueAt: string
  onAssigneeChange: (value: string) => void
  onPriorityChange: (value: string) => void
  onDueDateChange: (value: string) => void
  onSave: () => void
}

export default function AssignmentFields({
  users, assigneeId, priority, dueAt, onAssigneeChange, onPriorityChange, onDueDateChange, onSave,
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
          <Select value={priority} onChange={(e) => onPriorityChange(e.target.value)}>
            {['low', 'normal', 'high', 'urgent'].map((p) => (
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
    </section>
  )
}
