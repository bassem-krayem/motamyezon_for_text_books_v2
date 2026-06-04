import { useEffect, useRef, useState } from 'react'

const FORMAT_ORDER = ['epub', 'azw3', 'kfx']

/**
 * Triggers a download for a file URL. The book files live on public
 * DigitalOcean Spaces URLs; we fetch them as a blob so the browser saves the
 * file with a friendly name instead of navigating away.
 */
async function downloadFile(url, filename) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed (${res.status})`)
  const blob = await res.blob()
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(objectUrl)
}

const slugify = (s) =>
  (s || 'book')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-') || 'book'

export default function DownloadMenu({ fileFormats, title }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(null)
  const ref = useRef(null)

  const formats = FORMAT_ORDER.filter((f) => fileFormats?.[f])

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  if (!formats.length) {
    return <span className="muted muted--sm">No files</span>
  }

  const handleDownload = async (fmt) => {
    setBusy(fmt)
    try {
      await downloadFile(fileFormats[fmt], `${slugify(title)}.${fmt}`)
    } catch {
      // Fallback: open the URL directly if the blob fetch is blocked (CORS).
      window.open(fileFormats[fmt], '_blank', 'noopener')
    } finally {
      setBusy(null)
      setOpen(false)
    }
  }

  return (
    <div className="dropdown" ref={ref}>
      <button
        type="button"
        className="btn btn--primary btn--sm"
        onClick={() => setOpen((o) => !o)}
      >
        ⬇ Download
      </button>
      {open && (
        <div className="dropdown__menu" role="menu">
          {formats.map((fmt) => (
            <button
              key={fmt}
              type="button"
              className="dropdown__item"
              role="menuitem"
              disabled={busy === fmt}
              onClick={() => handleDownload(fmt)}
            >
              <span className="format-badge">{fmt.toUpperCase()}</span>
              {busy === fmt ? 'Downloading…' : `Download .${fmt}`}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
