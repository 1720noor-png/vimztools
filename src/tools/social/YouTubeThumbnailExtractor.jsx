import { useState } from 'react'
import { Field, Msg, CopyBtn } from '../../components/ui.jsx'

export default function YouTubeThumbnailExtractor() {
  const [url, setUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  const [videoData, setVideoData] = useState(null)
  const [err, setErr] = useState('')

  const extractId = (input) => {
    if (!input || typeof input !== 'string') return null
    const cleaned = input.trim()
    // Standard watch URL: youtube.com/watch?v=ID
    const watchMatch = cleaned.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
    if (watchMatch) return watchMatch[1]

    // Shortened URL: youtu.be/ID
    const shortMatch = cleaned.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
    if (shortMatch) return shortMatch[1]

    // Embed URL: youtube.com/embed/ID
    const embedMatch = cleaned.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/)
    if (embedMatch) return embedMatch[1]

    // Shorts URL: youtube.com/shorts/ID
    const shortsMatch = cleaned.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/)
    if (shortsMatch) return shortsMatch[1]

    // Live URL: youtube.com/live/ID
    const liveMatch = cleaned.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/)
    if (liveMatch) return liveMatch[1]

    // Raw 11-char ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(cleaned)) return cleaned

    return null
  }

  const handleExtract = () => {
    setErr('')
    const id = extractId(url)
    if (!id) {
      setErr('Please enter a valid YouTube video URL, Short link, or 11-character video ID.')
      setVideoData(null)
      return
    }

    const thumbnails = [
      {
        name: 'Maximum Resolution (HD / 1080p)',
        code: 'maxresdefault',
        url: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
        desc: '1920×1080 (HD / 4K source)',
        badge: 'Recommended'
      },
      {
        name: 'Standard Definition (SD)',
        code: 'sddefault',
        url: `https://img.youtube.com/vi/${id}/sddefault.jpg`,
        desc: '640×480 (4:3 Standard)',
        badge: 'SD'
      },
      {
        name: 'High Quality (HQ)',
        code: 'hqdefault',
        url: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        desc: '480×360 (Compressed preview)',
        badge: 'HQ'
      },
      {
        name: 'Medium Quality (MQ)',
        code: 'mqdefault',
        url: `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
        desc: '320×180 (Mobile grid)',
        badge: 'MQ'
      }
    ]

    setVideoData({
      id,
      watchUrl: `https://www.youtube.com/watch?v=${id}`,
      thumbnails
    })
  }

  const triggerDownload = async (imgUrl, filename) => {
    try {
      const response = await fetch(imgUrl)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch {
      window.open(imgUrl, '_blank')
    }
  }

  return (
    <div>
      <p style={{ color: 'var(--muted)', marginBottom: '1.25rem', lineHeight: '1.6' }}>
        Extract, inspect, and download official high-definition YouTube video thumbnails in all available resolutions (MaxRes 1080p, SD, HQ, and MQ). Works with standard videos, Shorts, and Live streams.
      </p>

      <div className="row">
        <Field label="YouTube Video URL or Video ID">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
          />
        </Field>
      </div>

      <div className="actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
        <button type="button" className="btn primary" onClick={handleExtract}>
          Extract Thumbnails
        </button>
        <button type="button" className="btn sub" onClick={() => { setUrl(''); setVideoData(null); setErr('') }}>
          Clear
        </button>
      </div>

      {err && <Msg kind="error">{err}</Msg>}

      {videoData && (
        <div className="out" style={{ marginTop: '1.5rem', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', padding: '1.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
            <div>
              <span className="badge sub" style={{ textTransform: 'uppercase', marginRight: '0.5rem' }}>Video ID: {videoData.id}</span>
              <a href={videoData.watchUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.88rem', color: 'var(--brand)', textDecoration: 'none' }}>
                Open on YouTube ↗
              </a>
            </div>
            <CopyBtn text={videoData.thumbnails[0].url} label="Copy MaxRes Link" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
            {videoData.thumbnails.map((thumb) => (
              <div
                key={thumb.code}
                style={{
                  background: 'var(--bg-soft)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.8rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.92rem' }}>{thumb.name}</strong>
                  <span className="badge" style={{ background: 'rgba(var(--brand-rgb), 0.12)', color: 'var(--brand)' }}>
                    {thumb.badge}
                  </span>
                </div>

                <div style={{ borderRadius: 'var(--r-sm)', overflow: 'hidden', border: '1px solid var(--line)', background: '#000', aspectRatio: '16/9', display: 'grid', placeItems: 'center' }}>
                  <img
                    src={thumb.url}
                    alt={`${thumb.name} preview`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--muted)' }}>
                  <span>{thumb.desc}</span>
                  <code>{thumb.code}.jpg</code>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <button
                    type="button"
                    className="btn primary sm"
                    style={{ flex: 1 }}
                    onClick={() => triggerDownload(thumb.url, `youtube-thumbnail-${videoData.id}-${thumb.code}.jpg`)}
                  >
                    Download Image
                  </button>
                  <a
                    href={thumb.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn sub sm"
                    style={{ textDecoration: 'none', display: 'grid', placeItems: 'center' }}
                  >
                    Direct URL
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.2rem', padding: '0.8rem 1rem', background: 'var(--bg-soft)', borderRadius: 'var(--r-sm)', fontSize: '0.82rem', color: 'var(--muted)' }}>
            💡 <strong>Privacy Note:</strong> Thumbnail extraction uses YouTube's official public image CDN (<code style={{ color: 'var(--brand)' }}>img.youtube.com</code>). Thumbnails are publicly cached visual assets and comply with standard platform linking terms.
          </div>
        </div>
      )}
    </div>
  )
}
