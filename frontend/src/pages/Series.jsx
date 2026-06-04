import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authorsApi, seriesApi } from '../api/resources'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Field from '../components/Field'
import Spinner from '../components/Spinner'

export default function Series() {
  const { user, isAuthenticated } = useAuth()
  const toast = useToast()
  const { data, loading, reload } = useApi(
    () => seriesApi.getAll({ limit: 100, sort: 'name' }),
    [],
  )
  const { data: authorsData } = useApi(
    () => authorsApi.getAll({ limit: 100, sort: 'name' }),
    [],
  )
  const series = data?.data || []
  const authors = authorsData?.data || []

  const canCreate =
    isAuthenticated && (user.role === 'admin' || user.role === 'uploader')
  const canDelete = isAuthenticated && user.role === 'admin'

  const [form, setForm] = useState({ name: '', description: '', author: '' })
  const [saving, setSaving] = useState(false)
  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const create = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await seriesApi.create(form)
      toast.success('Series created.')
      setForm({ name: '', description: '', author: '' })
      reload()
    } catch (err) {
      toast.error(err)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (s) => {
    if (!window.confirm(`Delete series "${s.name}"?`)) return
    try {
      await seriesApi.remove(s.id)
      toast.success('Series deleted.')
      reload()
    } catch (err) {
      toast.error(err)
    }
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1>Series</h1>
      </div>

      {canCreate && (
        <form onSubmit={create} className="form card card--inline">
          <h2>Add series</h2>
          <div className="form__row">
            <Field
              label="Name"
              name="name"
              value={form.name}
              onChange={onChange}
              required
            />
            <Field label="Author" name="author" required>
              <select name="author" value={form.author} onChange={onChange} required>
                <option value="">Select an author…</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field
            label="Description"
            name="description"
            value={form.description}
            onChange={onChange}
            textarea
          />
          <button className="btn btn--primary" disabled={saving}>
            {saving ? 'Saving…' : 'Add series'}
          </button>
        </form>
      )}

      {loading ? (
        <Spinner label="Loading series…" />
      ) : series.length === 0 ? (
        <div className="empty-state">
          <h2>No series yet</h2>
        </div>
      ) : (
        <div className="grid grid--list">
          {series.map((s) => (
            <div key={s.id} className="list-card">
              <div>
                <h3>
                  <Link to={`/series/${s.id}`}>{s.name}</Link>
                </h3>
                {s.description && <p className="muted">{s.description}</p>}
                {s.author?.name && (
                  <p className="muted muted--sm">by {s.author.name}</p>
                )}
              </div>
              {canDelete && (
                <button
                  type="button"
                  className="btn btn--danger btn--sm"
                  onClick={() => remove(s)}
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
