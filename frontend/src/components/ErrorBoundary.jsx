import { Component } from 'react'

/**
 * Catches render-time crashes so an unexpected bug shows a friendly screen
 * instead of a blank page — the UI counterpart to the backend's catch-all
 * "Something went wrong!" handler.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Render error caught by ErrorBoundary:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="empty-state">
          <h2>Something went wrong!</h2>
          <p>An unexpected error occurred while rendering this page.</p>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              this.setState({ error: null })
              window.location.assign('/')
            }}
          >
            Back to home
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
