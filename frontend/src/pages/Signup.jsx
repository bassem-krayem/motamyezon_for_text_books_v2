import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Field from '../components/Field'

const EMPTY = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  passwordConfirm: '',
}

export default function Signup() {
  const { signup } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()

    // Client-side guard before hitting the API — the server enforces this too.
    if (form.password !== form.passwordConfirm) {
      toast.error('Passwords do not match.')
      return
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }

    setSubmitting(true)
    try {
      const user = await signup(form)
      toast.success(`Account created. Welcome, ${user.firstName}!`)
      navigate('/books', { replace: true })
    } catch (err) {
      toast.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-card">
      <h1>Create an account</h1>
      <p className="muted">Join Motamyezon Books in a few seconds.</p>
      <form onSubmit={onSubmit} className="form">
        <div className="form__row">
          <Field
            label="First name"
            name="firstName"
            value={form.firstName}
            onChange={onChange}
            required
            autoComplete="given-name"
          />
          <Field
            label="Last name"
            name="lastName"
            value={form.lastName}
            onChange={onChange}
            required
            autoComplete="family-name"
          />
        </div>
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
          autoComplete="new-password"
          hint="Minimum 8 characters."
        />
        <Field
          label="Confirm password"
          name="passwordConfirm"
          type="password"
          value={form.passwordConfirm}
          onChange={onChange}
          required
          autoComplete="new-password"
        />
        <button className="btn btn--primary btn--block" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
      <div className="auth-card__footer">
        <span>
          Already have an account? <Link to="/login">Log in</Link>
        </span>
      </div>
    </div>
  )
}
