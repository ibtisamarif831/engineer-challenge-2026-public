import Button from '../ui/Button'
import Field from '../ui/Field'
import Input from '../ui/Input'

type InboxToolbarProps = {
  filter: string
  search: string
  onFilterChange: (filter: string) => void
  onSearchChange: (search: string) => void
  onExport: () => void
}

export default function InboxToolbar({ filter, search, onFilterChange, onSearchChange, onExport }: InboxToolbarProps) {
  return (
    <div className="toolbar">
      <div className="filters" role="group" aria-label="Filter by status">
        {['all', 'open', 'resolved'].map((status) => (
          <Button
            key={status}
            className={'filter-button' + (filter === status ? ' active' : '')}
            aria-pressed={filter === status}
            onClick={() => onFilterChange(status)}
          >
            {status[0].toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>
      <Field label="Search feedback" hideLabel className="search-field">
        <Input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search feedback…"
        />
      </Field>
      <Button className="export-button" onClick={onExport}>Export CSV</Button>
    </div>
  )
}
