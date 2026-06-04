import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Toaster from './components/Toaster'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'

import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Profile from './pages/Profile'
import Books from './pages/Books'
import BookDetail from './pages/BookDetail'
import BookUpload from './pages/BookUpload'
import BookEdit from './pages/BookEdit'
import Authors from './pages/Authors'
import AuthorDetail from './pages/AuthorDetail'
import Series from './pages/Series'
import SeriesDetail from './pages/SeriesDetail'
import Categories from './pages/Categories'
import CategoryDetail from './pages/CategoryDetail'
import NotFound from './pages/NotFound'

const UPLOADERS = ['admin', 'uploader']

export default function App() {
  return (
    <>
      <Navbar />
      <main className="app-main">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Books */}
            <Route path="/books" element={<Books />} />
            <Route
              path="/books/upload"
              element={
                <ProtectedRoute roles={UPLOADERS}>
                  <BookUpload />
                </ProtectedRoute>
              }
            />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route
              path="/books/:id/edit"
              element={
                <ProtectedRoute roles={UPLOADERS}>
                  <BookEdit />
                </ProtectedRoute>
              }
            />

            {/* Catalogue */}
            <Route path="/authors" element={<Authors />} />
            <Route path="/authors/:id" element={<AuthorDetail />} />
            <Route path="/series" element={<Series />} />
            <Route path="/series/:id" element={<SeriesDetail />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:id" element={<CategoryDetail />} />

            {/* Account */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </main>
      <Toaster />
    </>
  )
}
