import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="empty-state">
      <h1 className="not-found__code">404</h1>
      <h2>Page not found</h2>
      <p>The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link to="/" className="btn btn--primary">
        Back to home
      </Link>
    </div>
  )
}
