import { forwardRef, type InputHTMLAttributes } from 'react'

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return <input {...props} ref={ref} className={['input', className].filter(Boolean).join(' ')} />
})

export default Input
