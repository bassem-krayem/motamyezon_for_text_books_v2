import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../api/resources'
import { useToast } from '../context/ToastContext'
import Field from '../components/Field'

export default function ForgotPassword() {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await authApi.forgotPassword(email)
      setSent(true)
      toast.success(res.message || 'Token sent to email!')
    } catch (err) {
      toast.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-card">
      <h1>Forgot password</h1>
      <p className="muted">
        Enter your email and we&apos;ll send you a reset token.
      </p>
      {sent ? (
        <div className="notice notice--success">
          <p>
            If an account exists for <strong>{email}</strong>, a reset token has
            been emailed. The token expires in 10 minutes.
          </p>
          <Link to="/reset-password" className="btn btn--primary">
            I have a token
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="form">
          <Field
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
          <button className="btn btn--primary btn--block" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send reset token'}
          </button>
        </form>
      )}
      <div className="auth-card__footer">
        <Link to="/login">Back to login</Link>
      </div>
    </div>
  )
}
