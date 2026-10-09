import React, { useState } from 'react';

export default function HeadlineAbPowerTester() {
  const [headlineA, setHeadlineA] = useState('How to Use AI for Your Business in 2026');
  const [headlineB, setHeadlineB] = useState('7 Proven AI Workflows Top Teams Use to Cut 15 Hours of Busywork Every Week');
  const [copiedKey, setCopiedKey] = useState('');

  const analyzeHeadline = (text) => {
    const clean = text.trim();
    const words = clean.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const charCount = clean.length;

    // Power / Emotion words
    const powerWords = ['proven', 'secret', 'growth', 'master', 'insane', 'skyrocket', 'effortless', 'exponential', 'guaranteed', 'breakthrough', 'instant', 'elite'];
    const emotionalWords = ['shocking', 'mistake', 'costly', 'fear', 'freedom', 'danger', 'revolutionary', 'transform', 'failing', 'destroy'];
    const numberPattern = /\d+/;

    let powerCount = 0;
    let emotionCount = 0;

    words.forEach(w => {
      const lower = w.toLowerCase().replace(/[^a-z]/g, '');
      if (powerWords.includes(lower)) powerCount++;
      if (emotionalWords.includes(lower)) emotionCount++;
    });

    const hasNumber = numberPattern.test(clean);

    // Score calculation (0 to 100)
    let score = 50;
    if (wordCount >= 6 && wordCount <= 12) score += 15;
    else if (wordCount < 4 || wordCount > 18) score -= 15;

    if (charCount >= 45 && charCount <= 75) score += 10;
    
    if (powerCount > 0) score += Math.min(powerCount * 10, 15);
    if (emotionCount > 0) score += Math.min(emotionCount * 10, 10);
    if (hasNumber) score += 10;

    score = Math.min(Math.max(score, 20), 99);

    return {
      score,
      wordCount,
      charCount,
      powerCount,
      emotionCount,
      hasNumber
    };
  };

  const statA = analyzeHeadline(headlineA);
  const statB = analyzeHeadline(headlineB);

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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-semibold uppercase tracking-wider mb-2">
              📈 CTR Power Score
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Headline A/B Power Score & CTR Tester
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Compare two headlines side-by-side. Analyze psychological power words, emotional triggers, character lengths, and predicted CTR scores.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Variation A */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-bold uppercase tracking-wider">
              Variation A
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Score:</span>
              <span className={`text-xl font-bold font-mono ${statA.score >= 80 ? 'text-emerald-500' : statA.score >= 60 ? 'text-amber-500' : 'text-slate-500'}`}>
                {statA.score} / 100
              </span>
            </div>
          </div>

          <textarea
            rows={3}
            value={headlineA}
            onChange={(e) => setHeadlineA(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-none"
          />

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850">
              <span className="text-slate-400 block text-[10px]">Words / Chars</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{statA.wordCount} words ({statA.charCount} chars)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850">
              <span className="text-slate-400 block text-[10px]">Power Words</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{statA.powerCount} found</span>
            </div>
          </div>
        </div>

        {/* Variation B */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider">
              Variation B (Test)
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Score:</span>
              <span className={`text-xl font-bold font-mono ${statB.score >= 80 ? 'text-emerald-500' : statB.score >= 60 ? 'text-amber-500' : 'text-slate-500'}`}>
                {statB.score} / 100
              </span>
            </div>
          </div>

          <textarea
            rows={3}
            value={headlineB}
            onChange={(e) => setHeadlineB(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-none"
          />

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850">
              <span className="text-slate-400 block text-[10px]">Words / Chars</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{statB.wordCount} words ({statB.charCount} chars)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850">
              <span className="text-slate-400 block text-[10px]">Power Words</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{statB.powerCount} found</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
