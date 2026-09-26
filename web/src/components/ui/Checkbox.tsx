import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'children'> & {
  label: ReactNode
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, ...props },
  ref,
) {
  return (
    <label className="checkbox-row">
      <input {...props} ref={ref} type="checkbox" />
      {label}
    </label>
  )
})

export default Checkbox
