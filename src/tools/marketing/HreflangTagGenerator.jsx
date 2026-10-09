import React, { useState } from 'react';

const COMMON_LOCALES = [
  { lang: 'en', region: 'us', url: 'https://example.com/us/', label: 'English (United States)' },
  { lang: 'en', region: 'gb', url: 'https://example.com/uk/', label: 'English (United Kingdom)' },
  { lang: 'en', region: 'ca', url: 'https://example.com/ca/', label: 'English (Canada)' },
  { lang: 'es', region: 'es', url: 'https://example.com/es/', label: 'Spanish (Spain)' },
  { lang: 'es', region: 'mx', url: 'https://example.com/mx/', label: 'Spanish (Mexico)' },
  { lang: 'fr', region: 'fr', url: 'https://example.com/fr/', label: 'French (France)' },
  { lang: 'de', region: 'de', url: 'https://example.com/de/', label: 'German (Germany)' }
];

export default function HreflangTagGenerator() {
  const [defaultUrl, setDefaultUrl] = useState('https://example.com/');
  const [locales, setLocales] = useState(COMMON_LOCALES);
  const [includeXDefault, setIncludeXDefault] = useState(true);
  const [exportFormat, setExportFormat] = useState('html'); // 'html' or 'xml'
  const [copied, setCopied] = useState(false);

  const addLocale = () => {
    setLocales([
      ...locales,
      { lang: 'en', region: '', url: 'https://example.com/new-locale/', label: 'Custom Locale' }
    ]);
  };

  const removeLocale = (index) => {
    setLocales(locales.filter((_, idx) => idx !== index));
  };

  const updateLocale = (index, field, value) => {
    setLocales(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Generate HTML Tags
  const generateHtmlMarkup = () => {
    const lines = [];
    if (includeXDefault && defaultUrl) {
      lines.push(`<link rel="alternate" hreflang="x-default" href="${defaultUrl}" />`);
    }
    locales.forEach(loc => {
      const code = loc.region ? `${loc.lang.toLowerCase()}-${loc.region.toUpperCase()}` : loc.lang.toLowerCase();
      if (loc.url) {
        lines.push(`<link rel="alternate" hreflang="${code}" href="${loc.url}" />`);
      }
    });
    return lines.join('\n');
  };

  // Generate XML Sitemap Markup
  const generateXmlMarkup = () => {
    const lines = ['<!-- Paste inside each <url> block in your sitemap.xml -->'];
    if (includeXDefault && defaultUrl) {
      lines.push(`<xhtml:link rel="alternate" hreflang="x-default" href="${defaultUrl}"/>`);
    }
    locales.forEach(loc => {
      const code = loc.region ? `${loc.lang.toLowerCase()}-${loc.region.toUpperCase()}` : loc.lang.toLowerCase();
      if (loc.url) {
        lines.push(`<xhtml:link rel="alternate" hreflang="${code}" href="${loc.url}"/>`);
      }
    });
    return lines.join('\n');
  };

  const activeOutput = exportFormat === 'html' ? generateHtmlMarkup() : generateXmlMarkup();

  const copyTags = () => {
    navigator.clipboard.writeText(activeOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
              🌐 International SEO & Localization
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Hreflang & Multi-Regional SEO Tag Generator
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Generate error-free HTML & XML Sitemap hreflang annotations with ISO 639-1 language codes, ISO 3166-1 country regions, and x-default fallbacks.
            </p>
          </div>
          <button
            onClick={copyTags}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            {copied ? '✓ Copied' : '📋 Copy Annotations'}
          </button>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Default / Fallback */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              1. Global Fallback (x-default)
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  x-default URL (Serves unmatched languages / country selector)
                </label>
                <input
                  type="url"
                  value={defaultUrl}
                  onChange={(e) => setDefaultUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
              </div>
              <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeXDefault}
                  onChange={(e) => setIncludeXDefault(e.target.checked)}
                  className="rounded text-cyan-600"
                />
                Include x-default fallback tag in export
              </label>
            </div>
          </div>

          {/* Regional Locales */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                2. Regional Language & Country Targets
              </h2>
              <button
                onClick={addLocale}
                className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg font-semibold"
              >
                ➕ Add Target
              </button>
            </div>

            <div className="space-y-3">
              {locales.map((loc, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-2"
                >
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-3">
                      <label className="block text-[10px] text-slate-400 uppercase">Lang (ISO 639-1)</label>
                      <input
                        type="text"
                        maxLength="2"
                        value={loc.lang}
                        onChange={(e) => updateLocale(idx, 'lang', e.target.value.toLowerCase())}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs text-center font-mono uppercase"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[10px] text-slate-400 uppercase">Country (ISO 3166-1)</label>
                      <input
                        type="text"
                        maxLength="2"
                        value={loc.region}
                        onChange={(e) => updateLocale(idx, 'region', e.target.value.toUpperCase())}
                        placeholder="Optional"
                        className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs text-center font-mono uppercase"
                      />
                    </div>
                    <div className="col-span-5">
                      <label className="block text-[10px] text-slate-400 uppercase">Computed Hreflang</label>
                      <span className="inline-block px-2 py-1 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 rounded text-xs font-mono font-bold">
                        {loc.region ? `${loc.lang}-${loc.region}` : loc.lang}
                      </span>
                    </div>
                    <div className="col-span-1 text-right">
                      <button
                        onClick={() => removeLocale(idx)}
                        className="text-red-500 hover:text-red-700 text-sm font-bold"
                        title="Remove Locale"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div>
                    <input
                      type="url"
                      value={loc.url}
                      onChange={(e) => updateLocale(idx, 'url', e.target.value)}
                      placeholder="https://example.com/locale-path/"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Output & Best Practices */}
        <div className="lg:col-span-5 space-y-6">
          {/* Format Switcher */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Generated Markup
              </h3>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setExportFormat('html')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    exportFormat === 'html' ? 'bg-white dark:bg-slate-900 shadow-sm text-cyan-600' : 'text-slate-500'
                  }`}
                >
                  HTML &lt;head&gt;
                </button>
                <button
                  onClick={() => setExportFormat('xml')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    exportFormat === 'xml' ? 'bg-white dark:bg-slate-900 shadow-sm text-cyan-600' : 'text-slate-500'
                  }`}
                >
                  XML Sitemap
                </button>
              </div>
            </div>

            <pre className="p-4 bg-slate-900 text-cyan-300 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-96">
              {activeOutput}
            </pre>
          </div>

          {/* Reciprocal Linking Rules */}
          <div className="p-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-2xl text-xs text-amber-900 dark:text-amber-300 space-y-2">
            <div className="font-bold flex items-center gap-1.5">
              <span>⚠️</span> Mandatory Google Hreflang Rules:
            </div>
            <ul className="list-disc pl-4 space-y-1.5 leading-relaxed">
              <li><strong>Reciprocal Links:</strong> Hreflang annotations are bidirectional. If the English page references the Spanish page, the Spanish page MUST also reference the English page. Unmatched tags are ignored by Google.</li>
              <li><strong>Self-Referential Tag:</strong> Every localized page must include an hreflang tag pointing to itself.</li>
              <li><strong>Absolute URLs Only:</strong> Always include the complete protocol (`https://`) and trailing slashes if applicable.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
