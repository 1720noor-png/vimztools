import React, { useState } from 'react';

const PROVIDERS = [
  { name: 'YouTube', domain: /(?:youtube\.com|youtu\.be)/, endpoint: (url) => `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json` },
  { name: 'TikTok', domain: /tiktok\.com/, endpoint: (url) => `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}` },
  { name: 'Vimeo', domain: /vimeo\.com/, endpoint: (url) => `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}` },
  { name: 'Spotify', domain: /spotify\.com/, endpoint: (url) => `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}` },
  { name: 'Reddit', domain: /reddit\.com/, endpoint: (url) => `https://www.reddit.com/oembed?url=${encodeURIComponent(url)}` },
  { name: 'SoundCloud', domain: /soundcloud\.com/, endpoint: (url) => `https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json` }
];

export default function SocialMediaOembedViewer() {
  const [inputUrl, setInputUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchOembed = async (urlToFetch) => {
    const targetUrl = urlToFetch || inputUrl;
    if (!targetUrl.trim()) return;

    setLoading(true);
    setError(null);
    setMeta(null);

    // Identify provider
    const matched = PROVIDERS.find(p => p.domain.test(targetUrl));
    if (!matched) {
      setLoading(false);
      setError('Unrecognized or CORS-restricted platform. Supported open oEmbed endpoints: YouTube, TikTok, Vimeo, Spotify, Reddit, and SoundCloud.');
      return;
    }

    try {
      const endpoint = matched.endpoint(targetUrl.trim());
      const res = await fetch(endpoint);
      if (!res.ok) {
        throw new Error(`Platform returned HTTP status ${res.status}. Content may be private, geoblocked, or removed.`);
      }
      const data = await res.json();
      setMeta({ ...data, provider_name: data.provider_name || matched.name, original_url: targetUrl });
    } catch (err) {
      setError(err.message || 'Failed to retrieve oEmbed metadata. Verify URL is public and valid.');
    } finally {
      setLoading(false);
    }
  };

  const copyEmbedCode = () => {
    if (!meta?.html) return;
    navigator.clipboard.writeText(meta.html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Universal Social Media oEmbed Viewer & Code Generator</h2>
        <p style={{ margin: '0.3rem 0 0', color: 'var(--muted)', fontSize: '0.85rem' }}>
          Retrieve official embed codes, author details, and thumbnails from YouTube, TikTok, Vimeo, Spotify, and Reddit.
        </p>
      </div>

      {/* Input Box */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem' }}>
        <label style={{ fontSize: '0.9rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
          Paste Public Post, Video, or Audio URL:
        </label>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="e.g. https://www.youtube.com/watch?v=... or https://www.tiktok.com/@.../video/..."
            style={{ flex: 1, minWidth: '260px', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          />
          <button
            onClick={() => fetchOembed()}
            disabled={loading}
            className="btn primary"
            style={{ padding: '0.6rem 1.2rem' }}
          >
            {loading ? 'Retrieving…' : 'Fetch Embed Meta'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Try examples:</span>
          <button onClick={() => { setInputUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'); fetchOembed('https://www.youtube.com/watch?v=dQw4w9WgXcQ'); }} style={{ fontSize: '0.75rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer' }}>YouTube Video</button>
          <button onClick={() => { setInputUrl('https://vimeo.com/76979871'); fetchOembed('https://vimeo.com/76979871'); }} style={{ fontSize: '0.75rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer' }}>Vimeo Video</button>
          <button onClick={() => { setInputUrl('https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT'); fetchOembed('https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT'); }} style={{ fontSize: '0.75rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer' }}>Spotify Track</button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', color: '#9F1239', fontSize: '0.9rem' }}>
          ❌ <strong>Error:</strong> {error}
        </div>
      )}

      {/* Metadata Output Display */}
      {meta && (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', display: 'grid', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', background: 'var(--primary, #6C4CF1)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                {meta.provider_name}
              </span>
              <h3 style={{ margin: '0.4rem 0 0', fontSize: '1.15rem' }}>{meta.title || 'Untitled Media'}</h3>
            </div>
            {meta.author_name && (
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                By: {meta.author_url ? <a href={meta.author_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>{meta.author_name}</a> : <strong>{meta.author_name}</strong>}
              </div>
            )}
          </div>

          {/* Thumbnail preview */}
          {meta.thumbnail_url && (
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--muted)' }}>Official Thumbnail Asset:</div>
              <img
                src={meta.thumbnail_url}
                alt={meta.title || 'Thumbnail'}
                style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: '8px', border: '1px solid var(--border)', objectFit: 'contain' }}
              />
              <div style={{ marginTop: '0.3rem' }}>
                <a href={meta.thumbnail_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Open Full-Res Thumbnail ↗</a>
              </div>
            </div>
          )}

          {/* Embed snippet */}
          {meta.html && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Copy Official Embed Snippet:</span>
                <button onClick={copyEmbedCode} className="btn sub" style={{ fontSize: '0.75rem' }}>
                  {copied ? '✓ Copied Code' : 'Copy HTML Snippet'}
                </button>
              </div>
              <textarea
                readOnly
                rows="4"
                value={meta.html}
                style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.8rem', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
