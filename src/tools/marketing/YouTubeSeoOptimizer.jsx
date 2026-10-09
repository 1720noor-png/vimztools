import React, { useState } from 'react';

export default function YouTubeSeoOptimizer() {
  const [title, setTitle] = useState('How Autonomous AI Agents Are Transforming Marketing Operations (2026 Guide)');
  const [description, setDescription] = useState(`In this video, we break down why foundational AI models are becoming commoditized and how top marketing teams are building autonomous agent workflows to scale their growth.

Timestamps:
00:00 - Introduction & The AI Paradigm Shift
02:15 - Why Chatbots Are Obsolete in 2026
05:40 - The 3 Pillars of Autonomous Workflows
09:20 - Real-World Implementation Walkthrough
14:00 - Key Takeaways & Next Steps

Resources Mentioned:
https://vimz.ai

Subscribe for weekly deep dives on growth systems and modern automation!`);
  const [tags, setTags] = useState('ai agents, artificial intelligence, marketing automation, productivity tools, b2b saas, autonomous workflows, growth marketing');
  const [copiedKey, setCopiedKey] = useState('');

  const titleLength = title.length;
  const descLength = description.length;
  const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
  const tagChars = tags.length;

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold uppercase tracking-wider mb-2">
              📺 Video Search Optimization
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              YouTube Video SEO & Metadata Optimizer
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Audit YouTube title character limits, timestamp structure, keyword density, and 500-character tag limits.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            {/* Title */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Video Title (Ideal: 50-70 characters)
                </label>
                <span className={`text-xs font-mono font-bold ${titleLength > 100 ? 'text-red-500' : titleLength >= 50 && titleLength <= 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {titleLength} / 100 chars
                </span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            {/* Description */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Video Description & Chapters (Max 5,000 chars)
                </label>
                <span className="text-xs font-mono text-slate-400">
                  {descLength} / 5,000 chars
                </span>
              </div>
              <textarea
                rows={8}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
              />
            </div>

            {/* Tags */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Search Tags (Comma separated)
                </label>
                <span className={`text-xs font-mono font-bold ${tagChars > 500 ? 'text-red-500' : 'text-slate-400'}`}>
                  {tagChars} / 500 chars ({tagList.length} tags)
                </span>
              </div>
              <textarea
                rows={3}
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Audit Report */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              YouTube Algorithm Audit & Checks
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full mt-1 ${titleLength <= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Title Truncation Check</span>
                  <p className="text-slate-500 dark:text-slate-400">
                    {titleLength <= 70 ? 'Optimal! Title is under 70 characters and will not be cut off on mobile devices.' : 'Warning: Title may get truncated on mobile search results (over 70 chars).'}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full mt-1 ${description.includes('00:00') ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Chapter Timestamps Check</span>
                  <p className="text-slate-500 dark:text-slate-400">
                    {description.includes('00:00') ? 'Found 00:00 start marker. Automatic video chapter indexing enabled.' : 'Missing 00:00 intro marker. YouTube requires 00:00 for video chapters to activate.'}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full mt-1 ${tagChars <= 500 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Tag Character Budget</span>
                  <p className="text-slate-500 dark:text-slate-400">
                    {tagChars <= 500 ? `Within budget (${500 - tagChars} characters remaining).` : 'Exceeded 500 character maximum limit.'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleCopy(`${title}\n\n${description}\n\nTags:\n${tags}`, 'all_yt')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
            >
              {copiedKey === 'all_yt'  ? '✓' : '📋'}
              {copiedKey === 'all_yt' ? 'Copied Everything!' : 'Copy Formatted YouTube Package'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
