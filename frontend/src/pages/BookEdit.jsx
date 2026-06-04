import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  authorsApi,
  booksApi,
  categoriesApi,
  seriesApi,
} from '../api/resources'
import { useApi } from '../hooks/useApi'
import { useToast } from '../context/ToastContext'
import Field from '../components/Field'
import Spinner from '../components/Spinner'

const idOf = (v) => (typeof v === 'object' && v ? v.id : v) || ''

export default function BookEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const { data: bookData, loading } = useApi(() => booksApi.getOne(id), [id])
  const { data: authorsData } = useApi(
    () => authorsApi.getAll({ limit: 100, sort: 'name' }),
    [],
  )
  const { data: seriesData } = useApi(
    () => seriesApi.getAll({ limit: 100, sort: 'name' }),
    [],
  )
  const { data: categoriesData } = useApi(
    () => categoriesApi.getAll({ limit: 100, sort: 'name' }),
    [],
  )

  const authors = authorsData?.data || []
  const seriesList = seriesData?.data || []
  const categories = categoriesData?.data || []

  const [form, setForm] = useState({
    title: '',
    description: '',
    author: '',
    series: '',
  })
  const [selectedCategories, setSelectedCategories] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [seededId, setSeededId] = useState(null)

  // Seed the editable form from the fetched book. Adjusting state during render
  // when the source data changes is React's recommended alternative to an
  // effect (https://react.dev/learn/you-might-not-need-an-effect).
  const book = bookData?.data
  if (book && book.id !== seededId) {
    setSeededId(book.id)
    setForm({
      title: book.title || '',
      description: book.description || '',
      author: idOf(book.author),
      series: idOf(book.series),
    })
    setSelectedCategories((book.categories || []).map((c) => idOf(c)))
  }

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const toggleCategory = (cid) =>
    setSelectedCategories((prev) =>
      prev.includes(cid) ? prev.filter((c) => c !== cid) : [...prev, cid],
    )

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const body = {
        title: form.title,
        description: form.description,
        author: form.author,
        categories: selectedCategories,
      }
      if (form.series) body.series = form.series
      await booksApi.update(id, body)
      toast.success('Book updated.')
      navigate(`/books/${id}`)
    } catch (err) {
      toast.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner full label="Loading book…" />

  return (
    <div className="page">
      <Link to={`/books/${id}`} className="back-link">
        ← Back to book
      </Link>
      <div className="page__header">
        <h1>Edit book</h1>
      </div>
      <p className="muted">
        File formats can&apos;t be changed here — delete and re-upload the book to
        replace files.
      </p>

      <form onSubmit={onSubmit} className="form card">
        <Field
          label="Title"
          name="title"
          value={form.title}
          onChange={onChange}
          required
        />
        <Field
          label="Description"
          name="description"
          value={form.description}
          onChange={onChange}
          required
          textarea
        />
        <div className="form__row">
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
          <Field label="Series (optional)" name="series">
            <select name="series" value={form.series} onChange={onChange}>
              <option value="">No series</option>
              {seriesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="field">
          <span className="field__label">Categories</span>
          <div className="checkbox-grid">
            {categories.map((c) => (
              <label key={c.id} className="checkbox">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(c.id)}
                  onChange={() => toggleCategory(c.id)}
                />
                {c.name}
              </label>
            ))}
          </div>
        </div>
        <button className="btn btn--primary btn--block" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
