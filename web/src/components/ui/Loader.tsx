type LoaderProps = { label: string; size?: 'small' | 'medium' }

export default function Loader({ label, size = 'medium' }: LoaderProps) {
  return <p className={`loader loader-${size}`} role="status" aria-live="polite"><span className="loader-spinner" aria-hidden="true" /><span>{label}</span></p>
}
