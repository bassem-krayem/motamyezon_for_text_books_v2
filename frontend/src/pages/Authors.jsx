import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authorsApi } from '../api/resources'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Field from '../components/Field'
import Spinner from '../components/Spinner'

export default function Authors() {
  const { user, isAuthenticated } = useAuth()
  const toast = useToast()
  const { data, loading, reload } = useApi(
    () => authorsApi.getAll({ limit: 100, sort: 'name' }),
    [],
  )
  const authors = data?.data || []

  const canCreate =
    isAuthenticated && (user.role === 'admin' || user.role === 'uploader')
  const canDelete = isAuthenticated && user.role === 'admin'

  const [form, setForm] = useState({ name: '', bio: '' })
  const [saving, setSaving] = useState(false)

  const create = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await authorsApi.create(form)
      toast.success('Author created.')
      setForm({ name: '', bio: '' })
      reload()
    } catch (err) {
      toast.error(err)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (a) => {
    if (!window.confirm(`Delete author "${a.name}"?`)) return
    try {
      await authorsApi.remove(a.id)
      toast.success('Author deleted.')
      reload()
    } catch (err) {
      toast.error(err)
    }
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1>Authors</h1>
      </div>

      {canCreate && (
        <form onSubmit={create} className="form card card--inline">
          <h2>Add author</h2>
          <div className="form__row">
            <Field
              label="Name"
              name="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <Field
              label="Bio (optional)"
              name="bio"
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            />
          </div>
          <button className="btn btn--primary" disabled={saving}>
            {saving ? 'Saving…' : 'Add author'}
          </button>
        </form>
      )}

      {loading ? (
        <Spinner label="Loading authors…" />
      ) : authors.length === 0 ? (
        <div className="empty-state">
          <h2>No authors yet</h2>
        </div>
      ) : (
        <div className="grid grid--list">
          {authors.map((a) => (
            <div key={a.id} className="list-card">
              <div>
                <h3>
                  <Link to={`/authors/${a.id}`}>{a.name}</Link>
                </h3>
                {a.bio && <p className="muted">{a.bio}</p>}
              </div>
              {canDelete && (
                <button
                  type="button"
                  className="btn btn--danger btn--sm"
                  onClick={() => remove(a)}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
