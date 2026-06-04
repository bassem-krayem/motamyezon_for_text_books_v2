import api from './client'

// ---- Auth & Users -------------------------------------------------------
export const authApi = {
  signup: (body) => api.post('/users/signup', body).then((r) => r.data),
  login: (body) => api.post('/users/login', body).then((r) => r.data),
  logout: () => api.post('/users/logout').then((r) => r.data),
  forgotPassword: (email) =>
    api.post('/users/forgotPassword', { email }).then((r) => r.data),
  resetPassword: (token, body) =>
    api.patch(`/users/resetPassword/${token}`, body).then((r) => r.data),
  updateMyPassword: (body) =>
    api.patch('/users/updateMyPassword', body).then((r) => r.data),
  getMe: () => api.get('/users/me').then((r) => r.data),
  updateMe: (body) => api.patch('/users/updateMe', body).then((r) => r.data),
  deleteMe: () => api.delete('/users/deleteMe').then((r) => r.data),
  // Admin only
  getAllUsers: (params) => api.get('/users', { params }).then((r) => r.data),
}

// ---- Books --------------------------------------------------------------
export const booksApi = {
  getAll: (params) => api.get('/books', { params }).then((r) => r.data),
  getOne: (id) => api.get(`/books/${id}`).then((r) => r.data),
  // `formData` must be a FormData instance with title, description, author,
  // categories (JSON string), optional series, and the epub/azw3/kfx files.
  create: (formData, onUploadProgress) =>
    api
      .post('/books', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
      })
      .then((r) => r.data),
  update: (id, body) => api.patch(`/books/${id}`, body).then((r) => r.data),
  remove: (id) => api.delete(`/books/${id}`).then((r) => r.data),
}

// ---- Authors ------------------------------------------------------------
export const authorsApi = {
  getAll: (params) => api.get('/authors', { params }).then((r) => r.data),
  getOne: (id) => api.get(`/authors/${id}`).then((r) => r.data),
  create: (body) => api.post('/authors', body).then((r) => r.data),
  update: (id, body) => api.patch(`/authors/${id}`, body).then((r) => r.data),
  remove: (id) => api.delete(`/authors/${id}`).then((r) => r.data),
}

// ---- Series -------------------------------------------------------------
export const seriesApi = {
  getAll: (params) => api.get('/series', { params }).then((r) => r.data),
  getOne: (id) => api.get(`/series/${id}`).then((r) => r.data),
  create: (body) => api.post('/series', body).then((r) => r.data),
  update: (id, body) => api.patch(`/series/${id}`, body).then((r) => r.data),
  remove: (id) => api.delete(`/series/${id}`).then((r) => r.data),
}

// ---- Categories ---------------------------------------------------------
export const categoriesApi = {
  getAll: (params) => api.get('/categories', { params }).then((r) => r.data),
  getOne: (id) => api.get(`/categories/${id}`).then((r) => r.data),
  create: (body) => api.post('/categories', body).then((r) => r.data),
  update: (id, body) =>
    api.patch(`/categories/${id}`, body).then((r) => r.data),
  remove: (id) => api.delete(`/categories/${id}`).then((r) => r.data),
}
