import { useState } from 'react'
import { Link } from 'react-router-dom'
import { categoriesApi } from '../api/resources'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Field from '../components/Field'
import Spinner from '../components/Spinner'

export default function Categories() {
  const { user, isAuthenticated } = useAuth()
  const toast = useToast()
  const { data, loading, reload } = useApi(
    () => categoriesApi.getAll({ limit: 100, sort: 'name' }),
    [],
  )
  const categories = data?.data || []

  const canCreate =
    isAuthenticated && (user.role === 'admin' || user.role === 'uploader')
  const canDelete = isAuthenticated && user.role === 'admin'

  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const create = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await categoriesApi.create({ name })
      toast.success('Category created.')
      setName('')
      reload()
    } catch (err) {
      toast.error(err)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (c) => {
    if (!window.confirm(`Delete category "${c.name}"?`)) return
    try {
      await categoriesApi.remove(c.id)
      toast.success('Category deleted.')
      reload()
    } catch (err) {
      toast.error(err)
    }
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1>Categories</h1>
      </div>

      {canCreate && (
        <form onSubmit={create} className="form card card--inline">
          <h2>Add category</h2>
          <div className="form__row form__row--end">
            <Field
              label="Name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <button className="btn btn--primary" disabled={saving}>
              {saving ? 'Saving…' : 'Add'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <Spinner label="Loading categories…" />
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <h2>No categories yet</h2>
        </div>
      ) : (
        <div className="grid grid--chips">
          {categories.map((c) => (
            <div key={c.id} className="chip-card">
              <Link to={`/categories/${c.id}`} className="chip-card__name">
                {c.name}
                <span className="chip-card__count">{c.bookCount ?? 0}</span>
              </Link>
              {canDelete && (
                <button
                  type="button"
                  className="chip-card__delete"
                  aria-label={`Delete ${c.name}`}
                  onClick={() => remove(c)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
