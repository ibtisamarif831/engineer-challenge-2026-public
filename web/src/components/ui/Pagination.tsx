import Button from './Button'

type PaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  label: string
}

export default function Pagination({ page, totalPages, onPageChange, label }: PaginationProps) {
  return (
    <nav className="pager" aria-label={label}>
      <Button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</Button>
      <span>Page {page} of {totalPages}</span>
      <Button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</Button>
    </nav>
  )
}
