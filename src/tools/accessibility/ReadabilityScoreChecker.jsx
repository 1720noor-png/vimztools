import React, { useMemo, useState } from 'react';

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!word) return 0;
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function analyzeAccessibility(text) {
  if (!text || !text.trim()) return null;

  const rawSentences = text.trim().split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  const words = text.trim().match(/[A-Za-z'-]+/g) || [];
  
  if (words.length === 0) return null;

  const numWords = words.length;
  const numSentences = Math.max(1, rawSentences.length);

  // Syllables
  let complexWordsCount = 0; // >= 3 syllables
  let totalSyllables = 0;
  words.forEach(w => {
    const syl = countSyllables(w);
    totalSyllables += syl;
    if (syl >= 3) complexWordsCount++;
  });

  // Long sentences (> 25 words)
  const longSentences = rawSentences.filter(s => (s.match(/[A-Za-z'-]+/g) || []).length > 25);

  // Flesch Reading Ease
  const avgSentenceLength = numWords / numSentences;
  const avgSyllablesPerWord = totalSyllables / numWords;
  const fleschEase = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);

  // Flesch-Kincaid Grade
  const fkGrade = (0.39 * avgSentenceLength) + (11.8 * avgSyllablesPerWord) - 15.59;

  // WCAG 3.1.5 guideline: text should be understandable by someone with lower secondary education (~8th grade)
  const isWcagCompliant = fkGrade <= 8.5;

  return {
    numWords,
    numSentences,
    avgSentenceLength: avgSentenceLength.toFixed(1),
    complexWordsCount,
    complexWordsPercent: ((complexWordsCount / numWords) * 100).toFixed(1),
    longSentencesCount: longSentences.length,
    fleschEase: Math.max(0, Math.min(100, fleschEase)).toFixed(1),
    fkGrade: Math.max(1, fkGrade).toFixed(1),
    isWcagCompliant,
    longSentencesList: longSentences.slice(0, 3)
  };
}

export default function ReadabilityScoreChecker() {
  const [text, setText] = useState(
    `Vimz.ai provides fast and reliable productivity tools designed to make everyday workflows simpler for everyone. You can test your text to make sure your audience easily understands your message. Plain language ensures that information is accessible to users of all reading abilities, including second-language learners and people with cognitive disabilities.`
  );

  const metrics = useMemo(() => analyzeAccessibility(text), [text]);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-semibold uppercase tracking-wider mb-2">
          ♿ Digital Accessibility & WCAG 3.1.5
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Readability & Plain Language Accessibility Checker
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Audit text for WCAG 3.1.5 reading level guidelines, detect complex polysyllabic vocabulary, and highlight sentences that exceed accessible length limits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Text to Analyze
              </label>
              <span className="text-xs text-slate-400">
                {metrics ? `${metrics.numWords} words • ${metrics.numSentences} sentences` : '0 words'}
              </span>
            </div>
            <textarea
              rows={10}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white leading-relaxed"
              placeholder="Paste your content here..."
            />
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-5 space-y-4">
          {metrics ? (
            <>
              {/* WCAG Compliance Badge */}
              <div className={`p-5 rounded-2xl border ${
                metrics.isWcagCompliant
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                  : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{metrics.isWcagCompliant ? '✅' : '⚠️'}</span>
                  <div>
                    <h3 className="font-bold text-sm">
                      {metrics.isWcagCompliant ? 'WCAG 3.1.5 Reading Level Compliant' : 'Exceeds WCAG Reading Level Target'}
                    </h3>
                    <p className="text-xs mt-0.5 opacity-90">
                      {metrics.isWcagCompliant
                        ? `Grade level (${metrics.fkGrade}) is under the 8th-grade plain language threshold.`
                        : `Grade level (${metrics.fkGrade}) is too complex for universal accessibility. Aim for 8th grade or below.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Metric Scores */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                  <div className="text-xs text-slate-500">Flesch Reading Ease</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{metrics.fleschEase} / 100</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {parseFloat(metrics.fleschEase) >= 70 ? 'Easy to read' : parseFloat(metrics.fleschEase) >= 50 ? 'Standard' : 'Difficult'}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                  <div className="text-xs text-slate-500">Flesch-Kincaid Grade</div>
                  <div className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-1">{metrics.fkGrade}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">US School Grade</div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                  <div className="text-xs text-slate-500">Avg. Sentence Length</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{metrics.avgSentenceLength}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Words / sentence</div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                  <div className="text-xs text-slate-500">Complex Words (3+ syl)</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{metrics.complexWordsPercent}%</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{metrics.complexWordsCount} words</div>
                </div>
              </div>

              {/* Long sentence warnings */}
              {metrics.longSentencesCount > 0 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs space-y-2">
                  <div className="font-bold text-slate-700 dark:text-slate-300">
                    ⚠️ {metrics.longSentencesCount} sentence(s) exceed 25 words:
                  </div>
                  {metrics.longSentencesList.map((s, idx) => (
                    <div key={idx} className="p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 italic">
                      "{s}..."
                    </div>
                  ))}
                  <p className="text-slate-500 text-[11px]">Breaking these into two shorter sentences will significantly increase readability.</p>
                </div>
              )}
            </>
          ) : (
            <div className="h-48 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-sm">
              Enter text to inspect readability metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
