import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

type Props = {
  children: ReactNode
}

type State = {
  failed: boolean
}

export class MascotBoundary extends Component<Props, State> {
  state: State = {
    failed: false,
  }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(_: Error, __: ErrorInfo) {}

  render() {
    if (this.state.failed) {
      return null
    }

    return this.props.children
  }
}
