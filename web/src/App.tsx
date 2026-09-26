import { useState } from 'react'
import Login from './components/Login'
import Inbox from './components/Inbox'
import { User } from './types'

export default function App() {
  const [token, setToken] = useState<string>(() => localStorage.getItem('token') || '')
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })

  const onLogin = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  const onLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken('')
    setUser(null)
  }

  if (!token || !user) {
    return <Login onLogin={onLogin} />
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 12h4l3-6 4 12 3-6h4" />
              </svg>
            </span>
            Pulse
          </div>
          <div className="topbar-right">
            <span className="topbar-user">{user.name}</span>
            <button className="button button-inverse" onClick={onLogout}>
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="workspace">
        <Inbox token={token} />
      </main>
    </div>
  )
}
