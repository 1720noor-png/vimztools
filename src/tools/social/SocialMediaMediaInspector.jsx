import React, { useState } from 'react';

const PLATFORM_AUDIT = [
  {
    platform: 'YouTube',
    icon: '▶️',
    thumbnailSupport: 'Fully Supported (Client-Side)',
    imageDownload: 'High-Res JPEGs (1080p, 720p, 480p) directly from CDN',
    videoDownload: 'Requires Server-Side Worker (yt-dlp + ffmpeg)',
    technicalBarrier: 'YouTube separates audio and video into DASH/HLS streams; browser CORS blocks client-side stream muxing. Downloading requires an authenticated backend proxy.',
    compliantAlternative: 'Use Vimz.ai YouTube HD Thumbnail Extractor or export video metadata & chapter markers.'
  },
  {
    platform: 'Instagram (Reels / Posts)',
    icon: '📸',
    thumbnailSupport: 'Supported via Public Post oEmbed',
    imageDownload: 'Carousel slicing & dimension planning in-browser',
    videoDownload: 'Requires Backend Proxy / Meta Graph API',
    technicalBarrier: 'Instagram media CDN URLs are ephemeral, cryptographically signed, and protected against browser CORS and scraping bots.',
    compliantAlternative: 'Use Vimz.ai Instagram Grid & Carousel Splitter to generate panoramic multi-panel posts.'
  },
  {
    platform: 'TikTok',
    icon: '🎵',
    thumbnailSupport: 'Supported via TikTok oEmbed Endpoint',
    imageDownload: 'Cover photo previews available via public embed',
    videoDownload: 'Requires Specialized Reverse-Engineered Proxy',
    technicalBarrier: 'TikTok video blobs enforce mobile device signature handshakes. Watermark stripping requires third-party API processing.',
    compliantAlternative: 'Use Vimz.ai Reels & TikTok Hook Script Generator to craft viral scripts.'
  },
  {
    platform: 'Pinterest',
    icon: '📌',
    thumbnailSupport: 'Fully Supported for Public Pins',
    imageDownload: 'Supported via Direct Image Asset CDN URLs',
    videoDownload: 'Requires Backend HLS Stream Downloader',
    technicalBarrier: 'Standard image pins can be fetched directly; animated/video pins use segmented m3u8 playlists requiring backend aggregation.',
    compliantAlternative: 'Directly download public pin image assets via the Public Media Downloader below.'
  },
  {
    platform: 'X / Twitter',
    icon: '🐦',
    thumbnailSupport: 'Supported via Twitter Cards & OpenGraph',
    imageDownload: 'Supported for public tweets with attached photos',
    videoDownload: 'Requires Paid Twitter API v2 ($100+/mo) or Headless Worker',
    technicalBarrier: 'Twitter API paywalls native video stream access behind Enterprise/Pro tiers. Browser scraping violates CORS.',
    compliantAlternative: 'Use Vimz.ai Open Graph & Social Share Card Previewer to optimize tweet card meta tags.'
  },
  {
    platform: 'LinkedIn',
    icon: '💼',
    thumbnailSupport: 'Supported via OpenGraph Protocol',
    imageDownload: 'Supported for public articles and post banners',
    videoDownload: 'Requires Backend Session Proxy',
    technicalBarrier: 'LinkedIn strictly gates direct video media blobs behind active user session cookies and anti-bot rate limiters.',
    compliantAlternative: 'Use Vimz.ai Multi-Channel Content Repurposing Matrix to format text and carousel posts.'
  }
];

export default function SocialMediaMediaInspector() {
  const [inputUrl, setInputUrl] = useState('');
  const [downloadFilename, setDownloadFilename] = useState('media-asset');
  const [downloadStatus, setDownloadStatus] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  // Direct Public File Downloader (for CORS-enabled direct assets or user-owned media)
  const handleDirectDownload = async () => {
    if (!inputUrl.trim()) {
      setDownloadStatus('Please enter a valid media URL.');
      return;
    }

    try {
      setIsDownloading(true);
      setDownloadStatus('Fetching media blob from public URL...');
      
      const response = await fetch(inputUrl.trim(), { mode: 'cors' });
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      
      // Determine file extension
      let ext = 'bin';
      if (blob.type.includes('image/jpeg')) ext = 'jpg';
      else if (blob.type.includes('image/png')) ext = 'png';
      else if (blob.type.includes('image/webp')) ext = 'webp';
      else if (blob.type.includes('video/mp4')) ext = 'mp4';
      else if (blob.type.includes('video/webm')) ext = 'webm';

      a.download = `${downloadFilename || 'media-asset'}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);

      setDownloadStatus(`✓ Success! Downloaded ${blob.type} (${(blob.size / 1024).toFixed(1)} KB) directly.`);
    } catch (err) {
      setDownloadStatus(
        `⚠️ Direct browser download blocked by remote CORS headers (${err.message}). This platform requires a server-side proxy or authorized API credentials.`
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-semibold uppercase tracking-wider mb-2">
          🎬 Social Media Media Engineering & Compliance
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Social Media Media Inspector & Compliance Hub
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Technical feasibility matrix and authorized media downloader for YouTube, Instagram, TikTok, Pinterest, X, and LinkedIn.
        </p>
      </div>

      {/* Direct Public Media Downloader */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>📥</span> Direct Public Media Asset Downloader
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Enter direct media URLs (e.g., public CDN image links, open video assets, user-hosted media) to download raw binaries directly without compression.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8">
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://example.com/assets/sample-video.mp4 or image CDN link"
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div className="sm:col-span-4 flex gap-2">
            <input
              type="text"
              value={downloadFilename}
              onChange={(e) => setDownloadFilename(e.target.value)}
              placeholder="File name"
              className="w-2/3 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
            />
            <button
              onClick={handleDirectDownload}
              disabled={isDownloading}
              className="w-1/3 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {isDownloading ? '...' : 'Download'}
            </button>
          </div>
        </div>

        {downloadStatus && (
          <div className={`p-3 rounded-xl text-xs ${
            downloadStatus.startsWith('✓')
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
          }`}>
            {downloadStatus}
          </div>
        )}
      </div>

      {/* Technical Feasibility & Compliance Matrix */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>🛡️</span> Platform Capabilities & Technical Feasibility Audit
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PLATFORM_AUDIT.map((item) => (
            <div
              key={item.platform}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-white">
                  <span>{item.icon}</span>
                  <span>{item.platform}</span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                  {item.thumbnailSupport}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">Images / Covers:</span>{' '}
                  <span className="text-slate-600 dark:text-slate-400">{item.imageDownload}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">Binary Video Streams:</span>{' '}
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">{item.videoDownload}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-slate-500 dark:text-slate-400 leading-relaxed">
                  <strong>Technical Barrier:</strong> {item.technicalBarrier}
                </div>
                <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                  ✨ <strong>Compliant Alternative:</strong> {item.compliantAlternative}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
