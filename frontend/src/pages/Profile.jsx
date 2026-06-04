import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/resources'
import { tokenStore } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Field from '../components/Field'

export default function Profile() {
  const { user, setUser, logout, refreshUser } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [profile, setProfile] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
  })
  const [savingProfile, setSavingProfile] = useState(false)

  const [pwd, setPwd] = useState({
    passwordCurrent: '',
    password: '',
    passwordConfirm: '',
  })
  const [savingPwd, setSavingPwd] = useState(false)

  const onProfileChange = (e) =>
    setProfile((p) => ({ ...p, [e.target.name]: e.target.value }))
  const onPwdChange = (e) =>
    setPwd((p) => ({ ...p, [e.target.name]: e.target.value }))

  const saveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await authApi.updateMe(profile)
      setUser(res.data?.user || res.data)
      toast.success('Profile updated.')
    } catch (err) {
      toast.error(err)
      // Re-sync from server in case the local form drifted.
      refreshUser().catch(() => {})
    } finally {
      setSavingProfile(false)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    if (pwd.password !== pwd.passwordConfirm) {
      toast.error('New passwords do not match.')
      return
    }
    setSavingPwd(true)
    try {
      const res = await authApi.updateMyPassword(pwd)
      // A password change issues a fresh token and invalidates the old one.
      if (res.token) tokenStore.set(res.token)
      setPwd({ passwordCurrent: '', password: '', passwordConfirm: '' })
      toast.success('Password changed.')
    } catch (err) {
      toast.error(err)
    } finally {
      setSavingPwd(false)
    }
  }

  const deleteAccount = async () => {
    if (
      !window.confirm(
        'Deactivate your account? You will be logged out and cannot log back in.',
      )
    )
      return
    try {
      await authApi.deleteMe()
      toast.info('Your account has been deactivated.')
      await logout()
      navigate('/signup')
    } catch (err) {
      toast.error(err)
    }
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1>My profile</h1>
        <span className={`role-badge role-badge--${user.role}`}>{user.role}</span>
      </div>

      <div className="grid grid--2">
        <section className="card">
          <h2>Account details</h2>
          <form onSubmit={saveProfile} className="form">
            <div className="form__row">
              <Field
                label="First name"
                name="firstName"
                value={profile.firstName}
                onChange={onProfileChange}
                required
              />
              <Field
                label="Last name"
                name="lastName"
                value={profile.lastName}
                onChange={onProfileChange}
                required
              />
            </div>
            <Field
              label="Email"
              name="email"
              type="email"
              value={profile.email}
              onChange={onProfileChange}
              required
            />
            <button className="btn btn--primary" disabled={savingProfile}>
              {savingProfile ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </section>

        <section className="card">
          <h2>Change password</h2>
          <form onSubmit={changePassword} className="form">
            <Field
              label="Current password"
              name="passwordCurrent"
              type="password"
              value={pwd.passwordCurrent}
              onChange={onPwdChange}
              required
              autoComplete="current-password"
            />
            <Field
              label="New password"
              name="password"
              type="password"
              value={pwd.password}
              onChange={onPwdChange}
              required
              autoComplete="new-password"
              hint="Minimum 8 characters."
            />
            <Field
              label="Confirm new password"
              name="passwordConfirm"
              type="password"
              value={pwd.passwordConfirm}
              onChange={onPwdChange}
              required
              autoComplete="new-password"
            />
            <button className="btn btn--primary" disabled={savingPwd}>
              {savingPwd ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </section>
      </div>

      <section className="card card--danger">
        <h2>Danger zone</h2>
        <p className="muted">
          Deactivating your account is a soft delete — your data is kept but you
          can no longer log in.
        </p>
        <button type="button" className="btn btn--danger" onClick={deleteAccount}>
          Deactivate my account
        </button>
      </section>
    </div>
  )
}
