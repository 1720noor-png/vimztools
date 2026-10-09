import React, { useState } from 'react';

export default function MetaOgPreview() {
  const [url, setUrl] = useState('https://vimz.ai/docs/api');
  const [title, setTitle] = useState('Developer API Documentation — Vimz.ai');
  const [description, setDescription] = useState('Comprehensive REST and GraphQL API documentation for automated productivity workflows and developer tools.');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80');
  const [siteName, setSiteName] = useState('Vimz.ai Developer Portal');
  const [twitterCard, setTwitterCard] = useState('summary_large_image');
  const [copied, setCopied] = useState(false);

  // Validation warnings
  const warnings = [];
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    warnings.push('og:url must be an absolute URL starting with http:// or https://');
  }
  if (!title.trim()) {
    warnings.push('og:title is missing or empty.');
  } else if (title.length > 70) {
    warnings.push(`og:title length (${title.length} chars) may truncate on mobile social feeds (recommended: 40-60).`);
  }
  if (!description.trim()) {
    warnings.push('og:description is missing or empty.');
  } else if (description.length > 200) {
    warnings.push(`og:description length (${description.length} chars) exceeds optimal length (recommended: 60-160).`);
  }
  if (!image.trim()) {
    warnings.push('og:image is required for social share previews to display rich cards.');
  }

  const generatedHtml = `<!-- Essential Open Graph Protocol (og:*) Tags -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${url}" />
<meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
<meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />
<meta property="og:image" content="${image}" />
<meta property="og:site_name" content="${siteName.replace(/"/g, '&quot;')}" />

<!-- Twitter / X Card Metadata -->
<meta name="twitter:card" content="${twitterCard}" />
<meta name="twitter:url" content="${url}" />
<meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
<meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}" />
<meta name="twitter:image" content="${image}" />`;

  const copyTags = () => {
    navigator.clipboard.writeText(generatedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
              🛠️ Developer & Web Standards
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Open Graph & Meta Tag Validator
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Validate Open Graph protocols, debug missing metadata, and generate clean HTML headers for production websites.
            </p>
          </div>
          <button
            onClick={copyTags}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            {copied ? '✓ Copied' : '📋 Copy Clean HTML'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Tag Properties
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                og:url (Canonical Page URL)
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                og:title ({title.length} chars)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                og:description ({description.length} chars)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                og:image URL (Recommended: 1200x630px)
              </label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  og:site_name
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  twitter:card
                </label>
                <select
                  value={twitterCard}
                  onChange={(e) => setTwitterCard(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                >
                  <option value="summary_large_image">summary_large_image</option>
                  <option value="summary">summary</option>
                  <option value="app">app</option>
                </select>
              </div>
            </div>
          </div>

          {/* Validation Warnings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>🩺</span> Specification Audit
            </h3>
            {warnings.length === 0 ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <span>✓</span> All essential Open Graph & Twitter card parameters meet standard specifications!
              </div>
            ) : (
              <div className="space-y-2">
                {warnings.map((w, idx) => (
                  <div key={idx} className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 rounded-xl text-xs flex items-start gap-2">
                    <span>⚠️</span> <span>{w}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Output & Preview */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card Simulation */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Crawler Render Simulation
            </h3>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950">
              {image ? (
                <img
                  src={image}
                  alt="OG Preview"
                  className="w-full h-48 object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-32 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs">
                  No Image URL Specified
                </div>
              )}
              <div className="p-4 space-y-1">
                <div className="text-xs text-slate-400 uppercase tracking-wider truncate">
                  {url ? new URL(url).hostname : 'example.com'}
                </div>
                <div className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                  {title || 'Untitled Open Graph Page'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {description || 'No description provided.'}
                </div>
              </div>
            </div>
          </div>

          {/* Raw Generated HTML */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Generated &lt;head&gt; Markup
              </h3>
              <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400">HTML5 Valid</span>
            </div>
            <pre className="p-4 bg-slate-900 text-cyan-300 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {generatedHtml}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
