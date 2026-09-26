import { forwardRef, type SelectHTMLAttributes } from 'react'

const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, ...props },
  ref,
) {
  return <select {...props} ref={ref} className={['input', className].filter(Boolean).join(' ')} />
})

export default Select
