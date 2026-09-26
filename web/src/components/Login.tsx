import { useState, FormEvent } from 'react'
import { login } from '../api'
import { User } from '../types'
import Brand from './Brand'
import Button from './ui/Button'
import Field from './ui/Field'
import Input from './ui/Input'

export default function Login({ onLogin }: { onLogin: (token: string, user: User) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const { token, user } = await login(email, password)
      onLogin(token, user)
    } catch {
      setError('Invalid email or password')
    }
  }

  return (
    <main className="login-wrap">
      <form className="login-card panel" onSubmit={onSubmit}>
        <Brand />
        <div className="login-heading">
          <h1>Welcome back</h1>
          <p className="subtitle">Sign in to your feedback inbox.</p>
        </div>
        <Field label="Email">
          <Input
            autoComplete="username"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </Field>
        <Field label="Password">
          <Input
            autoComplete="current-password"
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </Field>
        {error && <div className="error" role="alert">{error}</div>}
        <Button variant="primary" type="submit">Sign in</Button>
      </form>
    </main>
  )
}
