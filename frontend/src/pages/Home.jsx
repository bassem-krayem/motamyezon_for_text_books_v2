import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="home">
      <section className="hero">
        <h1 className="hero__title">
          Motamyezon <span>Books</span>
        </h1>
        <p className="hero__subtitle">
          A consumer client for the Motamyezon Books API — browse the catalogue,
          download books in EPUB, AZW3 and KFX, and (if you&apos;re an uploader or
          admin) manage the whole library.
        </p>
        <div className="hero__actions">
          <Link to="/books" className="btn btn--primary btn--lg">
            Browse books
          </Link>
          {isAuthenticated ? (
            <Link to="/profile" className="btn btn--ghost btn--lg">
              {user.firstName ? `Hi, ${user.firstName}` : 'My profile'}
            </Link>
          ) : (
            <Link to="/signup" className="btn btn--ghost btn--lg">
              Create an account
            </Link>
          )}
        </div>
      </section>

      <section className="feature-grid">
        <FeatureCard
          icon="🔐"
          title="Authentication"
          text="Sign up, log in, reset your password and manage your profile with JWT-backed sessions."
          to="/login"
          cta="Log in"
        />
        <FeatureCard
          icon="📚"
          title="Browse & download"
          text="Explore books, authors, series and categories. Download any title in three formats."
          to="/books"
          cta="View books"
        />
        <FeatureCard
          icon="⬆️"
          title="Upload books"
          text="Uploaders and admins can add new books with EPUB, AZW3 and KFX files."
          to="/books/upload"
          cta="Upload"
        />
        <FeatureCard
          icon="🗂️"
          title="Manage catalogue"
          text="Create and curate authors, series and categories across the platform."
          to="/authors"
          cta="Authors"
        />
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, text, to, cta }) {
  return (
    <div className="feature-card">
      <span className="feature-card__icon" aria-hidden="true">
        {icon}
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      <Link to={to} className="feature-card__cta">
        {cta} →
      </Link>
    </div>
  )
}
