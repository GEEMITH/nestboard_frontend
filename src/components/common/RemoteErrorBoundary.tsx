import { Component, type ReactNode } from "react"

type Props = {
  name: string
  children: ReactNode
}

type State = { hasError: boolean }

export class RemoteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error(`[RemoteErrorBoundary] ${this.props.name} failed:`, error)
  }

  handleReload = () => {
    globalThis.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-8 py-10 text-center">
        <h2 className="text-xl font-semibold">
          {this.props.name} is unavailable
        </h2>
        <p className="text-muted-foreground max-w-md text-sm">
          We couldn't load this module. The service may be offline or still
          starting up. Once it's back, reload the page to try again.
        </p>
        <button
          type="button"
          onClick={this.handleReload}
          className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          Reload page
        </button>
      </div>
    )
  }
}
