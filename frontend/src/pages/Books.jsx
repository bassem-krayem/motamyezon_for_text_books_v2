import { useState } from 'react'
import { Link } from 'react-router-dom'
import { booksApi } from '../api/resources'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'
import DownloadMenu from '../components/DownloadMenu'

const PAGE_SIZE = 12
const canUpload = (role) => role === 'admin' || role === 'uploader'

export default function Books() {
  const { isAuthenticated, user } = useAuth()
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('-createdAt')
  const [search, setSearch] = useState('')

  const { data, loading } = useApi(
    () => booksApi.getAll({ page, limit: PAGE_SIZE, sort }),
    [page, sort],
  )

  const books = data?.data || []
  // The API filters server-side; this is a light client-side title filter on
  // top of the current page for quick narrowing.
  const visible = search
    ? books.filter((b) =>
        b.title?.toLowerCase().includes(search.toLowerCase()),
      )
    : books

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1>Books</h1>
          <p className="muted">Browse and download the catalogue.</p>
        </div>
        {isAuthenticated && canUpload(user.role) && (
          <Link to="/books/upload" className="btn btn--primary">
            + Upload book
          </Link>
        )}
      </div>

      <div className="toolbar">
        <input
          className="toolbar__search"
          type="search"
          placeholder="Filter this page by title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="-createdAt">Newest first</option>
          <option value="createdAt">Oldest first</option>
          <option value="title">Title A–Z</option>
          <option value="-title">Title Z–A</option>
        </select>
      </div>

      {loading ? (
        <Spinner label="Loading books…" />
      ) : visible.length === 0 ? (
        <div className="empty-state">
          <h2>No books found</h2>
          <p>There are no books to show on this page.</p>
        </div>
      ) : (
        <div className="grid grid--cards">
          {visible.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}

      <div className="pagination">
        <button
          type="button"
          className="btn btn--ghost"
          disabled={page <= 1 || loading}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          ← Previous
        </button>
        <span className="pagination__page">Page {page}</span>
        <button
          type="button"
          className="btn btn--ghost"
          disabled={loading || books.length < PAGE_SIZE}
          onClick={() => setPage((p) => p + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  )
}

function BookCard({ book }) {
  const authorName =
    typeof book.author === 'object' ? book.author?.name : book.author
  return (
    <article className="book-card">
      <Link to={`/books/${book.id}`} className="book-card__cover">
        <span className="book-card__spine" aria-hidden="true" />
        <span className="book-card__title-on-cover">{book.title}</span>
      </Link>
      <div className="book-card__body">
        <h3 className="book-card__title">
          <Link to={`/books/${book.id}`}>{book.title}</Link>
        </h3>
        {authorName && <p className="book-card__author">by {authorName}</p>}
        {book.description && (
          <p className="book-card__desc">{book.description}</p>
        )}
        <div className="book-card__tags">
          {(book.categories || []).slice(0, 3).map((c) => (
            <span key={c.id || c} className="tag">
              {c.name || c}
            </span>
          ))}
        </div>
      </div>
      <div className="book-card__footer">
        <Link to={`/books/${book.id}`} className="btn btn--ghost btn--sm">
          Details
        </Link>
        <DownloadMenu fileFormats={book.fileFormats} title={book.title} />
      </div>
    </article>
  )
}
