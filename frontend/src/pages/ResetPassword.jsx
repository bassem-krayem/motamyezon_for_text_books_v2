import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { authApi } from '../api/resources'
import { tokenStore } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Field from '../components/Field'

export default function ResetPassword() {
  const toast = useToast()
  const navigate = useNavigate()
  const { handleAuthSuccess } = useAuth()
  const params = useParams()
  const [searchParams] = useSearchParams()

  // The reset link from email may carry the token as a path param or ?token=.
  const [token, setToken] = useState(
    params.token || searchParams.get('token') || '',
  )
  const [form, setForm] = useState({ password: '', passwordConfirm: '' })
  const [submitting, setSubmitting] = useState(false)

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.passwordConfirm) {
      toast.error('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      const res = await authApi.resetPassword(token, form)
      // Reset logs the user straight in with a fresh token.
      if (res.token) tokenStore.set(res.token)
      handleAuthSuccess(res)
      toast.success('Password reset. You are now logged in.')
      navigate('/books', { replace: true })
    } catch (err) {
      toast.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-card">
      <h1>Reset password</h1>
      <p className="muted">Paste your reset token and choose a new password.</p>
      <form onSubmit={onSubmit} className="form">
        <Field
          label="Reset token"
          name="token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
          placeholder="Token from your email"
        />
        <Field
          label="New password"
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          required
          autoComplete="new-password"
          hint="Minimum 8 characters."
        />
        <Field
          label="Confirm new password"
          name="passwordConfirm"
          type="password"
          value={form.passwordConfirm}
          onChange={onChange}
          required
          autoComplete="new-password"
        />
        <button className="btn btn--primary btn--block" disabled={submitting}>
          {submitting ? 'Resetting…' : 'Reset password'}
        </button>
      </form>
      <div className="auth-card__footer">
        <Link to="/login">Back to login</Link>
      </div>
    </div>
  )
}
