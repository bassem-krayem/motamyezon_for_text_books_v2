import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from './Spinner'

/**
 * Guards routes that need a session. `roles` optionally restricts access to
 * specific user roles (admin / uploader / user), mirroring the API's RBAC.
 */
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Spinner full label="Checking your session…" />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="empty-state">
        <h2>Access denied</h2>
        <p>
          You do not have permission to view this page. It requires the{' '}
          <strong>{roles.join(' or ')}</strong> role, but your role is{' '}
          <strong>{user.role}</strong>.
        </p>
      </div>
    )
  }

  return children
}
