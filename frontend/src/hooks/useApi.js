import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../context/ToastContext'

/**
 * Runs an async fetcher on mount (and whenever `deps` change), tracking
 * loading/error/data and surfacing failures through the global toast.
 * Returns `{ data, loading, error, reload }`.
 */
export function useApi(fetcher, deps = [], { onError } = {}) {
  const toast = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetcher()
      setData(res)
      return res
    } catch (err) {
      setError(err)
      if (onError) onError(err)
      else toast.error(err)
    } finally {
      setLoading(false)
    }
    // The caller supplies the dependency array dynamically; the hook re-runs
    // whenever those change.
    // eslint-disable-next-line react-hooks/use-memo, react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    run()
  }, [run])

  return { data, loading, error, reload: run }
}
