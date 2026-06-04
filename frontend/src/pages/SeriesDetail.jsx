import { Link, useParams } from 'react-router-dom'
import { seriesApi } from '../api/resources'
import { useApi } from '../hooks/useApi'
import Spinner from '../components/Spinner'

export default function SeriesDetail() {
  const { id } = useParams()
  const { data, loading } = useApi(() => seriesApi.getOne(id), [id])
  const series = data?.data

  if (loading) return <Spinner full label="Loading series…" />
  if (!series)
    return (
      <div className="empty-state">
        <h2>Series not found</h2>
        <Link to="/series" className="btn btn--primary">
          Back to series
        </Link>
      </div>
    )

  return (
    <div className="page">
      <Link to="/series" className="back-link">
        ← All series
      </Link>
      <div className="page__header">
        <h1>{series.name}</h1>
      </div>
      {series.author?.name && (
        <p className="detail__author">
          by <Link to={`/authors/${series.author.id}`}>{series.author.name}</Link>
        </p>
      )}
      {series.description && <p className="detail__desc">{series.description}</p>}

      <section>
        <h2>Books in this series</h2>
        {series.books?.length ? (
          <div className="grid grid--list">
            {series.books.map((b) => (
              <div key={b.id} className="list-card">
                <h3>
                  <Link to={`/books/${b.id}`}>{b.title}</Link>
                </h3>
                {b.description && <p className="muted">{b.description}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">No books in this series.</p>
        )}
      </section>
    </div>
  )
}
