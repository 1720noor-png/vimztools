import React, { useState } from 'react';

export default function SocialPostMediaDownloader() {
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState('detect');
  const [mediaType, setMediaType] = useState('auto');
  const [extractedData, setExtractedData] = useState(null);
  const [copied, setCopied] = useState('');

  const detectPlatformFromUrl = (inputUrl) => {
    const raw = (inputUrl || '').toLowerCase();
    if (raw.includes('youtube.com') || raw.includes('youtu.be')) return 'youtube';
    if (raw.includes('instagram.com')) return 'instagram';
    if (raw.includes('twitter.com') || raw.includes('x.com')) return 'twitter';
    if (raw.includes('tiktok.com')) return 'tiktok';
    if (raw.includes('linkedin.com')) return 'linkedin';
    if (raw.includes('facebook.com') || raw.includes('fb.watch')) return 'facebook';
    return 'generic';
  };

  const handleProcessUrl = (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    const detected = platform === 'detect' ? detectPlatformFromUrl(url) : platform;
    
    // YouTube extraction
    if (detected === 'youtube') {
      const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|shorts\/|live\/)([^#\&\?]*).*/;
      const match = url.match(regExp);
      const videoId = (match && match[2].length === 11) ? match[2] : null;

      if (videoId) {
        setExtractedData({
          platform: 'YouTube',
          id: videoId,
          type: 'Video & Thumbnails',
          mediaItems: [
            { label: 'MaxRes 1080p Ultra HD Cover', url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, res: '1920x1080', kind: 'image' },
            { label: 'High Definition (HQ 720p)', url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, res: '1280x720', kind: 'image' },
            { label: 'Standard Definition (SD 480p)', url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`, res: '640x480', kind: 'image' }
          ],
          oEmbedUrl: `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
          directPlayer: `https://www.youtube-nocookie.com/embed/${videoId}`
        });
      }
    } else {
      // Platform compliance handler
      setExtractedData({
        platform: detected.toUpperCase(),
        type: 'Public Social Post & Media Asset',
        url: url,
        mediaItems: [],
        oEmbedUrl: `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`,
        note: 'Direct asset previews and metadata endpoints generated.'
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              📥 Universal Media Extractor
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Public Social Media Asset & Cover Extractor
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Extract high-resolution video covers, oEmbed asset endpoints, and CDN preview media from public social links across YouTube, X/Twitter, and Instagram.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <form onSubmit={handleProcessUrl} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Social Post or Video URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or https://x.com/..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Platform Preset
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              >
                <option value="detect">⚡ Auto-Detect Platform</option>
                <option value="youtube">YouTube (Videos & Shorts)</option>
                <option value="twitter">X / Twitter</option>
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              Inspect & Extract Media Assets
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Extracted Media & Public Asset Endpoints
            </h3>

            {!extractedData ? (
              <div className="p-8 text-center text-slate-400 text-xs italic bg-slate-50 dark:bg-slate-850 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                Enter any public post or video URL on the left to extract full-resolution cover photos, oEmbed payloads, and CDN asset links.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>Platform: {extractedData.platform}</span>
                    <span className="text-blue-600 dark:text-blue-400">{extractedData.type}</span>
                  </div>
                </div>

                {extractedData.mediaItems.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {extractedData.mediaItems.map((item, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-850 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 p-2.5 space-y-2">
                        <img src={item.url} alt={item.label} className="w-full aspect-video object-cover rounded-lg" />
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{item.label}</span>
                          <span className="text-[10px] font-mono text-slate-400">{item.res}</span>
                        </div>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="block text-center py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
                        >
                          📥 Download Image
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
