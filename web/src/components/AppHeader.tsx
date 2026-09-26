import Brand from './Brand'
import Button from './ui/Button'

type AppHeaderProps = {
  userName: string
  onLogout: () => void
}

export default function AppHeader({ userName, onLogout }: AppHeaderProps) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Brand />
        <div className="topbar-right">
          <span className="topbar-user">{userName}</span>
          <Button variant="inverse" onClick={onLogout}>Sign out</Button>
        </div>
      </div>
    </header>
  )
}
