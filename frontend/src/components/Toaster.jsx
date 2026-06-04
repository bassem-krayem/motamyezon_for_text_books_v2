import { useToastState } from '../context/ToastContext'

const ICONS = {
  success: '✓',
  info: 'ℹ',
  fail: '!',
  error: '✕',
}

const LABELS = {
  success: 'Success',
  info: 'Info',
  fail: 'fail', // operational error — matches backend status
  error: 'error', // server error — matches backend status
}

export default function Toaster() {
  const { toasts, dismiss } = useToastState()

  if (!toasts.length) return null

  return (
    <div className="toaster" role="region" aria-label="Notifications">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`} role="alert">
          <span className="toast__icon" aria-hidden="true">
            {ICONS[t.type] || 'ℹ'}
          </span>
          <div className="toast__body">
            <div className="toast__title">
              {LABELS[t.type] || 'Notice'}
              {t.statusCode ? (
                <span className="toast__code"> · {t.statusCode}</span>
              ) : null}
            </div>
            <div className="toast__message">{t.message}</div>
          </div>
          <button
            type="button"
            className="toast__close"
            aria-label="Dismiss"
            onClick={() => dismiss(t.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
