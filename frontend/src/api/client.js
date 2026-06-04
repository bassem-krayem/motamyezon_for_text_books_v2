import axios from 'axios'

// Base URL for the Motamyezon Books API. In dev, Vite proxies `/api` to the
// backend (see vite.config.js); in production set VITE_API_URL to the full URL.
const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

const TOKEN_KEY = 'motamyezon_token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

const api = axios.create({
  baseURL: BASE_URL,
})

// Attach the JWT to every request as a Bearer token.
api.interceptors.request.use((config) => {
  const token = tokenStore.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Normalises any axios failure into the same `{ status, message, statusCode }`
 * shape the backend's global error handler produces, so the UI has a single,
 * predictable error contract to render. Mirrors controllers/errorController.js.
 */
export class ApiError extends Error {
  constructor({ message, status, statusCode }) {
    super(message)
    this.name = 'ApiError'
    this.status = status // "fail" | "error"
    this.statusCode = statusCode
    this.isOperational = status === 'fail'
  }
}

function normaliseError(error) {
  // The server answered with a structured error body.
  if (error.response) {
    const { status: statusCode, data } = error.response
    return new ApiError({
      message: data?.message || 'Something went wrong!',
      status: data?.status || (statusCode < 500 ? 'fail' : 'error'),
      statusCode,
    })
  }

  // Request left the browser but no response came back (server down / CORS).
  if (error.request) {
    return new ApiError({
      message:
        'Could not reach the server. Make sure the API is running and try again.',
      status: 'error',
      statusCode: 0,
    })
  }

  // Something failed while setting up the request.
  return new ApiError({
    message: error.message || 'Unexpected error',
    status: 'error',
    statusCode: 0,
  })
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // A 401 means the token is missing/expired/invalid — drop it so the app
    // falls back to the logged-out state.
    if (error.response?.status === 401) {
      tokenStore.clear()
    }
    return Promise.reject(normaliseError(error))
  },
)

export default api
