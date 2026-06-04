import { createContext, useCallback, useContext, useRef, useState } from 'react'

const ToastContext = createContext(null)

let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    if (timers.current[id]) {
      clearTimeout(timers.current[id])
      delete timers.current[id]
    }
  }, [])

  const push = useCallback(
    (toast) => {
      const id = ++idCounter
      const next = { id, duration: 5000, type: 'info', ...toast }
      setToasts((prev) => [...prev, next])
      if (next.duration > 0) {
        timers.current[id] = setTimeout(() => dismiss(id), next.duration)
      }
      return id
    },
    [dismiss],
  )

  // Helpers. `error` understands the ApiError shape from api/client.js: a
  // `status` of "fail" is an operational/expected problem (amber), while
  // "error" is a server fault (red) — matching the backend's error handler.
  const toast = {
    success: (message) => push({ type: 'success', message }),
    info: (message) => push({ type: 'info', message }),
    error: (err) => {
      const message =
        typeof err === 'string' ? err : err?.message || 'Something went wrong!'
      const type = err?.status === 'error' ? 'error' : 'fail'
      const statusCode = typeof err === 'object' ? err?.statusCode : undefined
      return push({ type, message, statusCode, duration: 7000 })
    },
  }

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx.toast
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToastState() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToastState must be used within a ToastProvider')
  return { toasts: ctx.toasts, dismiss: ctx.dismiss }
}
