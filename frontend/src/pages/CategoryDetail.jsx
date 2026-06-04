import { Link, useParams } from 'react-router-dom'
import { categoriesApi } from '../api/resources'
import { useApi } from '../hooks/useApi'
import Spinner from '../components/Spinner'

export default function CategoryDetail() {
  const { id } = useParams()
  const { data, loading } = useApi(() => categoriesApi.getOne(id), [id])
  const category = data?.data

  if (loading) return <Spinner full label="Loading category…" />
  if (!category)
    return (
      <div className="empty-state">
        <h2>Category not found</h2>
        <Link to="/categories" className="btn btn--primary">
          Back to categories
        </Link>
      </div>
    )

  return (
    <div className="page">
      <Link to="/categories" className="back-link">
        ← All categories
      </Link>
      <div className="page__header">
        <h1>{category.name}</h1>
        <span className="role-badge">{category.bookCount ?? 0} books</span>
      </div>

      <section>
        <h2>Books in this category</h2>
        {category.books?.length ? (
          <div className="grid grid--list">
            {category.books.map((b) => {
              const authorName =
                typeof b.author === 'object' ? b.author?.name : null
              return (
                <div key={b.id} className="list-card">
                  <div>
                    <h3>
                      <Link to={`/books/${b.id}`}>{b.title}</Link>
                    </h3>
                    {authorName && (
                      <p className="muted muted--sm">by {authorName}</p>
                    )}
                    {b.description && <p className="muted">{b.description}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="muted">No books in this category.</p>
        )}
      </section>
    </div>
  )
}
