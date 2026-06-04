import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const canUpload = (role) => role === 'admin' || role === 'uploader'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.info('You have been logged out.')
    navigate('/login')
  }

  const link = ({ isActive }) => (isActive ? 'navlink navlink--active' : 'navlink')
  const close = () => setOpen(false)

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink to="/" className="brand" onClick={close}>
          <span className="brand__mark">📚</span>
          <span className="brand__name">Motamyezon</span>
        </NavLink>

        <button
          type="button"
          className="navbar__toggle"
          aria-label="Toggle navigation"
          onClick={() => setOpen((o) => !o)}
        >
          ☰
        </button>

        <nav className={open ? 'navbar__nav navbar__nav--open' : 'navbar__nav'}>
          <NavLink to="/books" className={link} onClick={close}>
            Books
          </NavLink>
          <NavLink to="/authors" className={link} onClick={close}>
            Authors
          </NavLink>
          <NavLink to="/series" className={link} onClick={close}>
            Series
          </NavLink>
          <NavLink to="/categories" className={link} onClick={close}>
            Categories
          </NavLink>
          {isAuthenticated && canUpload(user.role) && (
            <NavLink to="/books/upload" className={link} onClick={close}>
              Upload
            </NavLink>
          )}

          <span className="navbar__spacer" />

          {isAuthenticated ? (
            <div className="navbar__user">
              <NavLink to="/profile" className={link} onClick={close}>
                <span className="avatar" aria-hidden="true">
                  {(user.firstName?.[0] || user.email?.[0] || '?').toUpperCase()}
                </span>
                <span className="navbar__username">
                  {user.firstName || user.email}
                  <span className={`role-badge role-badge--${user.role}`}>
                    {user.role}
                  </span>
                </span>
              </NavLink>
              <button type="button" className="btn btn--ghost" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar__user">
              <NavLink to="/login" className="btn btn--ghost" onClick={close}>
                Login
              </NavLink>
              <NavLink to="/signup" className="btn btn--primary" onClick={close}>
                Sign up
              </NavLink>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
