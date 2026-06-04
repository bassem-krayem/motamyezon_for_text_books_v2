import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

const MAX_SIZE = 50 * 1024 * 1024 // 50MB per file
const FORMATS = ['epub', 'azw3', 'kfx']

const formatBytes = (bytes) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`
}

export default function BookUpload() {
  const toast = useToast()
  const navigate = useNavigate()

  const { data: authorsData, loading: loadingAuthors } = useApi(
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
  const [files, setFiles] = useState({ epub: null, azw3: null, kfx: null })
  const [progress, setProgress] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const toggleCategory = (id) =>
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    )

  const onFileChange = (fmt) => (e) => {
    const file = e.target.files?.[0] || null
    if (file && file.size > MAX_SIZE) {
      toast.error(`${fmt.toUpperCase()} file exceeds the 50MB limit.`)
      e.target.value = ''
      return
    }
    setFiles((prev) => ({ ...prev, [fmt]: file }))
  }

  const validate = () => {
    if (!form.title.trim()) return 'Title is required.'
    if (!form.description.trim()) return 'Description is required.'
    if (!form.author) return 'Please select an author.'
    if (selectedCategories.length === 0)
      return 'Select at least one category.'
    for (const fmt of FORMATS) {
      if (!files[fmt]) return `The ${fmt.toUpperCase()} file is required.`
    }
    return null
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const problem = validate()
    if (problem) {
      toast.error(problem)
      return
    }

    const fd = new FormData()
    fd.append('title', form.title)
    fd.append('description', form.description)
    fd.append('author', form.author)
    if (form.series) fd.append('series', form.series)
    fd.append('categories', JSON.stringify(selectedCategories))
    FORMATS.forEach((fmt) => fd.append(fmt, files[fmt]))

    setSubmitting(true)
    setProgress(0)
    try {
      const res = await booksApi.create(fd, (evt) => {
        if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100))
      })
      toast.success('Book uploaded successfully.')
      navigate(`/books/${res.data.id}`)
    } catch (err) {
      toast.error(err)
    } finally {
      setSubmitting(false)
      setProgress(0)
    }
  }

  if (loadingAuthors) return <Spinner full label="Preparing upload form…" />

  return (
    <div className="page">
      <div className="page__header">
        <h1>Upload a book</h1>
      </div>
      <p className="muted">
        All three formats (EPUB, AZW3, KFX) are required, each up to 50MB.
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
          <span className="field__label">
            Categories<span className="field__required"> *</span>
          </span>
          <div className="checkbox-grid">
            {categories.length === 0 && (
              <span className="muted">No categories available yet.</span>
            )}
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

        <div className="field">
          <span className="field__label">Book files</span>
          <div className="file-inputs">
            {FORMATS.map((fmt) => (
              <div key={fmt} className="file-input">
                <div className="file-input__head">
                  <span className="format-badge">{fmt.toUpperCase()}</span>
                  {files[fmt] && (
                    <span className="file-input__size">
                      {formatBytes(files[fmt].size)}
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  accept={`.${fmt}`}
                  onChange={onFileChange(fmt)}
                />
                {files[fmt] && (
                  <span className="file-input__name">{files[fmt].name}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {submitting && progress > 0 && (
          <div className="progress">
            <div className="progress__bar" style={{ width: `${progress}%` }} />
            <span className="progress__label">{progress}%</span>
          </div>
        )}

        <button className="btn btn--primary btn--block" disabled={submitting}>
          {submitting ? 'Uploading…' : 'Upload book'}
        </button>
      </form>
    </div>
  )
}
