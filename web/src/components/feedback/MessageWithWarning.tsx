const URL_PATTERN = /\b(?:https?:\/\/|www\.)[^\s<>"']+/i

export function containsUrl(message: string): boolean {
  return URL_PATTERN.test(message)
}

export default function MessageWithWarning({
  message,
  className = '',
  warnIfUrl,
}: {
  message: string
  className?: string
  warnIfUrl?: boolean
}) {
  return (
    <>
      {(warnIfUrl ?? containsUrl(message)) && (
        <p className="message-warning" role="note">
          <strong>Potential spam:</strong> This message contains a URL. Check the destination before opening it.
        </p>
      )}
      <span className={className}>{message}</span>
    </>
  )
}
