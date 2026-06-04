import { Link, useParams } from 'react-router-dom'
import { authorsApi } from '../api/resources'
import { useApi } from '../hooks/useApi'
import Spinner from '../components/Spinner'

export default function AuthorDetail() {
  const { id } = useParams()
  const { data, loading } = useApi(() => authorsApi.getOne(id), [id])
  const author = data?.data

  if (loading) return <Spinner full label="Loading author…" />
  if (!author)
    return (
      <div className="empty-state">
        <h2>Author not found</h2>
        <Link to="/authors" className="btn btn--primary">
          Back to authors
        </Link>
      </div>
    )

  return (
    <div className="page">
      <Link to="/authors" className="back-link">
        ← All authors
      </Link>
      <div className="page__header">
        <h1>{author.name}</h1>
      </div>
      {author.bio && <p className="detail__desc">{author.bio}</p>}

      <section>
        <h2>Books</h2>
        {author.books?.length ? (
          <div className="grid grid--list">
            {author.books.map((b) => (
              <div key={b.id} className="list-card">
                <h3>
                  <Link to={`/books/${b.id}`}>{b.title}</Link>
                </h3>
                {b.description && <p className="muted">{b.description}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">No books for this author.</p>
        )}
      </section>

      <section>
        <h2>Series</h2>
        {author.series?.length ? (
          <div className="grid grid--list">
            {author.series.map((s) => (
              <div key={s.id} className="list-card">
                <h3>
                  <Link to={`/series/${s.id}`}>{s.name}</Link>
                </h3>
                {s.description && <p className="muted">{s.description}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">No series for this author.</p>
        )}
      </section>
    </div>
  )
}
