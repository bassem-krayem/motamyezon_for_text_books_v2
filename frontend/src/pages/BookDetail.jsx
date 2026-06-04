import { Link, useNavigate, useParams } from 'react-router-dom'
import { booksApi } from '../api/resources'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Spinner from '../components/Spinner'
import DownloadMenu from '../components/DownloadMenu'

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const toast = useToast()

  const { data, loading } = useApi(() => booksApi.getOne(id), [id])
  const book = data?.data

  const canEdit =
    isAuthenticated && (user.role === 'admin' || user.role === 'uploader')
  const canDelete = isAuthenticated && user.role === 'admin'

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${book.title}"? This cannot be undone.`)) return
    try {
      await booksApi.remove(id)
      toast.success('Book deleted.')
      navigate('/books')
    } catch (err) {
      toast.error(err)
    }
  }

  if (loading) return <Spinner full label="Loading book…" />
  if (!book)
    return (
      <div className="empty-state">
        <h2>Book not found</h2>
        <Link to="/books" className="btn btn--primary">
          Back to books
        </Link>
      </div>
    )

  const author = typeof book.author === 'object' ? book.author : null
  const series = typeof book.series === 'object' ? book.series : null

  return (
    <div className="page">
      <Link to="/books" className="back-link">
        ← All books
      </Link>

      <div className="detail">
        <div className="detail__cover">
          <span className="detail__cover-title">{book.title}</span>
        </div>

        <div className="detail__main">
          <h1>{book.title}</h1>
          {author && (
            <p className="detail__author">
              by{' '}
              <Link to={`/authors/${author.id}`}>{author.name}</Link>
            </p>
          )}

          {book.description && <p className="detail__desc">{book.description}</p>}

          <dl className="meta-list">
            {series && (
              <div>
                <dt>Series</dt>
                <dd>
                  <Link to={`/series/${series.id}`}>{series.name}</Link>
                </dd>
              </div>
            )}
            {book.categories?.length > 0 && (
              <div>
                <dt>Categories</dt>
                <dd className="detail__tags">
                  {book.categories.map((c) => (
                    <Link
                      key={c.id || c}
                      to={`/categories/${c.id || c}`}
                      className="tag tag--link"
                    >
                      {c.name || c}
                    </Link>
                  ))}
                </dd>
              </div>
            )}
            {book.createdAt && (
              <div>
                <dt>Added</dt>
                <dd>{book.createdAt}</dd>
              </div>
            )}
            <div>
              <dt>Book ID</dt>
              <dd className="mono">{book.id}</dd>
            </div>
          </dl>

          <div className="detail__downloads">
            <h3>Available formats</h3>
            <div className="format-list">
              {['epub', 'azw3', 'kfx'].map((fmt) =>
                book.fileFormats?.[fmt] ? (
                  <a
                    key={fmt}
                    href={book.fileFormats[fmt]}
                    className="format-chip"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="format-badge">{fmt.toUpperCase()}</span>
                    Open / download
                  </a>
                ) : null,
              )}
            </div>
            <div className="detail__actions">
              <DownloadMenu fileFormats={book.fileFormats} title={book.title} />
              {canEdit && (
                <Link to={`/books/${book.id}/edit`} className="btn btn--ghost">
                  Edit details
                </Link>
              )}
              {canDelete && (
                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
