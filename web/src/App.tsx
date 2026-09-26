import { useEffect, useState } from 'react'
import Login from './components/Login'
import Inbox from './components/Inbox'
import ErrorBoundary from './components/ErrorBoundary'
import AppHeader from './components/AppHeader'
import { initializeDrafts, hasDrafts, clearDrafts, draftsNeedUnloadWarning } from './navigation/drafts'
import { User } from './types'

export default function App() {
  const [token, setToken] = useState<string>(() => localStorage.getItem('token') || '')
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })

  if (user) initializeDrafts(user.id)

  useEffect(() => {
    if (!token || !user) document.title = 'Sign in · Pulse'
  }, [token, user])

  useEffect(() => {
    const onUnload = (event: BeforeUnloadEvent) => {
      if (draftsNeedUnloadWarning()) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', onUnload)
    return () => window.removeEventListener('beforeunload', onUnload)
  }, [])

  const onLogin = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  const onLogout = () => {
    if (hasDrafts() && !window.confirm('Discard all unsaved ticket drafts and sign out? Cancel to keep editing.')) return
    try { clearDrafts() } catch {
      window.alert('Unable to discard stored drafts. Please enable browser storage and try signing out again.')
      return
    }
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
