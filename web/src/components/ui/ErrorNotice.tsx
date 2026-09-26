import Button from './Button'

export default function ErrorNotice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  if (!message) return null
  return (
    <div className="error" role="alert">
      <p>{message}</p>
      {onRetry && <Button onClick={onRetry}>Try again</Button>}
    </div>
  )
}
