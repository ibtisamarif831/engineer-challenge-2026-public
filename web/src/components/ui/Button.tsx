import { forwardRef, type ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'secondary' | 'primary' | 'quiet' | 'inverse' | 'plain'
}

const variantClasses = {
  secondary: 'button',
  primary: 'button button-primary',
  quiet: 'button button-quiet',
  inverse: 'button button-inverse',
  plain: '',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', type = 'button', className, ...props },
  ref,
) {
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      className={[variantClasses[variant], className].filter(Boolean).join(' ')}
    />
  )
})

export default Button
