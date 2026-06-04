import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Field from '../components/Field'

export default function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/books'

  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const user = await login(form)
      toast.success(`Welcome back, ${user.firstName || user.email}!`)
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-card">
      <h1>Log in</h1>
      <p className="muted">Access your Motamyezon Books account.</p>
      <form onSubmit={onSubmit} className="form">
        <Field
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
        <Field
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          required
          autoComplete="current-password"
          placeholder="••••••••"
        />
        <button className="btn btn--primary btn--block" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <div className="auth-card__footer">
        <Link to="/forgot-password">Forgot password?</Link>
        <span>
          New here? <Link to="/signup">Create an account</Link>
        </span>
      </div>
    </div>
  )
}
