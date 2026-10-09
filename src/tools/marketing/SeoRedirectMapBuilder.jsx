import React, { useState } from 'react';

export default function SeoRedirectMapBuilder() {
  const [redirectType, setRedirectType] = useState('301');
  const [copiedFormat, setCopiedFormat] = useState('');
  const [redirects, setRedirects] = useState([
    { id: '1', from: '/old-blog/seo-tips', to: '/guides/seo-best-practices' },
    { id: '2', from: '/pricing-2024', to: '/pricing' },
    { id: '3', from: '/features/ai-writer', to: '/tools/content-repurposing-matrix' },
    { id: '4', from: '/contact-us.html', to: '/contact' }
  ]);

  const addRow = () => {
    setRedirects([...redirects, { id: Date.now().toString(), from: '', to: '' }]);
  };

  const updateRow = (id, field, value) => {
    setRedirects(redirects.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const deleteRow = (id) => {
    setRedirects(redirects.filter(r => r.id !== id));
  };

  const generateHtaccess = () => {
    let out = `# Apache .htaccess ${redirectType} Permanent Redirects\nRewriteEngine On\n\n`;
    redirects.forEach(r => {
      if (r.from && r.to) {
        out += `RedirectMatch ${redirectType} ^${r.from}$ ${r.to}\n`;
      }
    });
    return out;
  };

  const generateNginx = () => {
    let out = `# Nginx Server Block ${redirectType} Redirect Rules\n\n`;
    redirects.forEach(r => {
      if (r.from && r.to) {
        out += `rewrite ^${r.from}$ ${r.to} permanent;\n`;
      }
    });
    return out;
  };

  const generateNetlify = () => {
    let out = `# Netlify _redirects file\n\n`;
    redirects.forEach(r => {
      if (r.from && r.to) {
        out += `${r.from}  ${r.to}  ${redirectType}!\n`;
      }
    });
    return out;
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(key);
    setTimeout(() => setCopiedFormat(''), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              ⇄ Migration Infrastructure
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              SEO 301 / 302 Redirect Map Builder
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Construct high-performance URL redirection maps for site migrations and export Nginx, Apache .htaccess, and Netlify _redirect rules.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table editor */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Status Code:</label>
                <select
                  value={redirectType}
                  onChange={(e) => setRedirectType(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                >
                  <option value="301">301 (Permanent Move)</option>
                  <option value="302">302 (Temporary Move)</option>
                </select>
              </div>
              <button
                onClick={addRow}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold"
              >
                ➕ Add URL Pair
              </button>
            </div>

            <div className="space-y-2.5">
              {redirects.map((row) => (
                <div key={row.id} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <input
                    type="text"
                    value={row.from}
                    onChange={(e) => updateRow(row.id, 'from', e.target.value)}
                    placeholder="Old Path (e.g. /old-page)"
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                  />
                  <span className="text-slate-400 text-xs">→</span>
                  <input
                    type="text"
                    value={row.to}
                    onChange={(e) => updateRow(row.id, 'to', e.target.value)}
                    placeholder="New Path (e.g. /new-page)"
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                  />
                  <button
                    onClick={() => deleteRow(row.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Server Config Outputs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Server Config Exports
            </h3>

            {/* Netlify */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Netlify (_redirects)</span>
                <button
                  onClick={() => handleCopy(generateNetlify(), 'netlify')}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  {copiedFormat === 'netlify' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="p-3 bg-slate-950 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-24">
                {generateNetlify()}
              </pre>
            </div>

            {/* Nginx */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Nginx Config</span>
                <button
                  onClick={() => handleCopy(generateNginx(), 'nginx')}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  {copiedFormat === 'nginx' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="p-3 bg-slate-950 rounded-xl text-[11px] font-mono text-indigo-300 overflow-x-auto max-h-24">
                {generateNginx()}
              </pre>
            </div>

            {/* Apache */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Apache (.htaccess)</span>
                <button
                  onClick={() => handleCopy(generateHtaccess(), 'apache')}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  {copiedFormat === 'apache' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="p-3 bg-slate-950 rounded-xl text-[11px] font-mono text-amber-300 overflow-x-auto max-h-24">
                {generateHtaccess()}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
