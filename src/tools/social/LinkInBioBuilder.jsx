import React, { useState } from 'react';

export default function LinkInBioBuilder() {
  const [profileName, setProfileName] = useState('Alex Rivera');
  const [bio, setBio] = useState('Digital Strategist & Founder at Nexus Labs 🚀 Sharing high-leverage marketing systems & tech breakdowns.');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80');
  const [theme, setTheme] = useState('midnight');
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');

  const [links, setLinks] = useState([
    { id: '1', title: '🔥 Read Latest Tech Newsletter', url: 'https://newsletter.example.com', featured: true },
    { id: '2', title: '🎙️ Founder Podcast (Spotify & Apple)', url: 'https://podcast.example.com', featured: false },
    { id: '3', title: '💼 1-on-1 Strategy Consulting', url: 'https://cal.com/example', featured: false },
    { id: '4', title: '📦 Free Marketing Automation Notion Template', url: 'https://notion.so/example', featured: false },
  ]);

  const themes = {
    midnight: {
      name: 'Midnight Slate',
      bg: 'bg-slate-950 text-slate-100',
      cardBg: 'bg-slate-900 border-slate-800 text-white hover:bg-slate-850 hover:border-violet-500/50',
      btnBg: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white',
      badge: 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
    },
    aurora: {
      name: 'Aurora Gradient',
      bg: 'bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 text-white',
      cardBg: 'bg-white/10 backdrop-blur-md border-white/15 text-white hover:bg-white/15',
      btnBg: 'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white',
      badge: 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30'
    },
    clean: {
      name: 'Clean Minimalist',
      bg: 'bg-slate-50 text-slate-900',
      cardBg: 'bg-white border-slate-200 text-slate-900 hover:border-slate-400 shadow-sm',
      btnBg: 'bg-slate-900 text-white hover:bg-slate-800',
      badge: 'bg-slate-200 text-slate-800'
    },
    emerald: {
      name: 'Emerald Luxe',
      bg: 'bg-emerald-950 text-emerald-50',
      cardBg: 'bg-emerald-900/60 border-emerald-800 text-white hover:border-emerald-500/50',
      btnBg: 'bg-emerald-600 text-white hover:bg-emerald-500',
      badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
    }
  };

  const addLink = () => {
    setLinks([...links, { id: Date.now().toString(), title: 'New Custom Link', url: 'https://', featured: false }]);
  };

  const updateLink = (id, field, value) => {
    setLinks(links.map(link => link.id === id ? { ...link, [field]: value } : link));
  };

  const deleteLink = (id) => {
    setLinks(links.filter(link => link.id !== id));
  };

  const generateStandaloneHtml = () => {
    const activeTheme = themes[theme];
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${profileName} | Official Links</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>body {font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="${activeTheme.bg} min-h-screen flex flex-col items-center p-6 sm:p-12">
  <div class="w-full max-w-md mx-auto flex flex-col items-center text-center">
    <img src="${avatarUrl}" alt="${profileName}" class="w-24 h-24 rounded-full object-cover shadow-xl ring-4 ring-white/10 mb-4">
    <h1 class="text-xl font-bold tracking-tight">${profileName}</h1>
    <p class="text-xs sm:text-sm mt-2 opacity-80 leading-relaxed px-4">${bio}</p>
    
    <div class="w-full mt-8 space-y-3.5">
      ${links.map(l => `
      <a href="${l.url}" target="_blank" rel="noopener noreferrer" class="block w-full p-4 rounded-xl border font-medium text-sm transition-all transform hover:-translate-y-0.5 ${l.featured  ? 'activeTheme.btnBg' : 'activeTheme.cardBg'}">
        ${l.title}
      </a>`).join('')}
    </div>

    <footer class="mt-12 text-xs opacity-50">
      Powered by Vimz.ai Bio Builder
    </footer>
  </div>
</body>
</html>`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateStandaloneHtml());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-semibold uppercase tracking-wider mb-2">
              ✨ Mobile Traffic Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Link-in-Bio Landing Page Builder
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Build and host your responsive custom bio page with zero coding. Export pure standalone HTML/CSS in 1-click.
            </p>
          </div>
          <button
            onClick={handleCopyCode}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            {copiedCode  ? '✓' : '💻'}
            {copiedCode ? 'HTML Code Copied!' : 'Export Standalone HTML'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Controls */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              🎨 Bio Profile Customization
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Full Name / Handle
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Bio Description
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                Theme Preset
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(themes).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => setTheme(key)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                      theme === key
                        ? 'border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Links List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Custom Links ({links.length})
                </span>
                <button
                  onClick={addLink}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-medium transition-colors"
                >
                  ➕ Add Link
                </button>
              </div>

              <div className="space-y-2.5">
                {links.map((link) => (
                  <div key={link.id} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={link.title}
                        onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                        placeholder="Link Label"
                        className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                        placeholder="https://"
                        className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                    <label className="flex items-center gap-1 text-xs text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={link.featured}
                        onChange={(e) => updateLink(link.id, 'featured', e.target.checked)}
                        className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                      />
                      <span className="hidden sm:inline">Highlight</span>
                    </label>
                    <button
                      onClick={() => deleteLink(link.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Mobile Device Preview */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-[320px] sm:w-[350px] bg-slate-900 rounded-[40px] p-4 shadow-2xl border-4 border-slate-700 ring-1 ring-slate-800">
            {/* Phone Speaker & Camera Notch */}
            <div className="w-28 h-4 bg-slate-800 rounded-full mx-auto mb-4" />
            
            {/* Phone Screen */}
            <div className={`rounded-[28px] p-5 min-h-[520px] flex flex-col items-center text-center ${themes[theme].bg} transition-colors duration-300`}>
              <img
                src={avatarUrl}
                alt={profileName}
                className="w-20 h-20 rounded-full object-cover shadow-lg ring-2 ring-white/20 mb-3"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'; }}
              />
              <h3 className="text-base font-bold tracking-tight">{profileName || 'Your Name'}</h3>
              <p className="text-[11px] mt-1 opacity-75 leading-relaxed line-clamp-3 px-2">
                {bio || 'Your bio description will appear right here.'}
              </p>

              <div className="w-full mt-6 space-y-2.5 flex-1">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`block w-full p-3 rounded-xl border text-xs font-semibold tracking-wide transition-transform hover:scale-[1.02] shadow-sm ${
                      link.featured  ? 'themes[theme].btnBg' : 'themes[theme].cardBg'}`}
                  >
                    {link.title}
                  </a>
                ))}
              </div>

              <div className="mt-6 text-[10px] opacity-40">
                vimz.ai/bio/{profileName.toLowerCase().replace(/\s+/g, '')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
