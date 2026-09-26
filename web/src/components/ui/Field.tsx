import type { LabelHTMLAttributes, ReactNode } from 'react'

type FieldProps = LabelHTMLAttributes<HTMLLabelElement> & {
  label: ReactNode
  hideLabel?: boolean
}

// Wrap one control to keep its accessible name associated without managing IDs.
export default function Field({ label, hideLabel = false, className, children, ...props }: FieldProps) {
  return (
    <label {...props} className={[!hideLabel && 'field', className].filter(Boolean).join(' ')}>
      {hideLabel ? <span className="sr-only">{label}</span> : label}
      {children}
    </label>
  )
}
