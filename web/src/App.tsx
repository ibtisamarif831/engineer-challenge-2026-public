import { useState } from 'react'
import Login from './components/Login'
import Inbox from './components/Inbox'
import ErrorBoundary from './components/ErrorBoundary'
import AppHeader from './components/AppHeader'
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
      <AppHeader userName={user.name} onLogout={onLogout} />
      <main className="workspace">
        <ErrorBoundary key={token}><Inbox token={token} /></ErrorBoundary>
      </main>
    </div>
  )
}
