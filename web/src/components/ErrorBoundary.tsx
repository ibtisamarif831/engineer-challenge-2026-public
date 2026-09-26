import { Component, type ReactNode } from 'react'
import Button from './ui/Button'

export default class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <section className="panel empty-state" role="alert" aria-label="Unexpected error">
          <h1>Something went wrong</h1>
          <p>This view could not be displayed. Retrying will reset this view and may clear unsaved changes.</p>
          <div className="detail-actions">
            <Button onClick={() => this.setState({ failed: false })}>Try again</Button>
            <Button onClick={() => window.location.reload()}>Reload page</Button>
          </div>
        </section>
      )
    }
    return this.props.children
  }
}
