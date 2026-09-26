import { useState, FormEvent } from 'react'
import { login } from '../api'
import { User } from '../types'

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
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 12h4l3-6 4 12 3-6h4" />
            </svg>
          </span>
          Pulse
        </div>
        <div className="login-heading">
          <h1>Welcome back</h1>
          <p className="subtitle">Sign in to your feedback inbox.</p>
        </div>
        <label className="field">
          Email
          <input
            className="input"
            autoComplete="username"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </label>
        <label className="field">
          Password
          <input
            className="input"
            autoComplete="current-password"
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>
        {error && <div className="error" role="alert">{error}</div>}
        <button className="button button-primary" type="submit">Sign in</button>
      </form>
    </main>
  )
}
