import React, { useState, useMemo } from 'react';

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!word) return 0;
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function analyzeAcademicReading(text) {
  if (!text || !text.trim()) return null;

  const rawSentences = text.trim().split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  const words = text.trim().match(/[A-Za-z'-]+/g) || [];
  
  if (words.length < 5) return null;

  const numWords = words.length;
  const numSentences = Math.max(1, rawSentences.length);
  const charactersCount = words.reduce((acc, w) => acc + w.replace(/[^A-Za-z]/g, '').length, 0);

  let totalSyllables = 0;
  let complexWordsCount = 0; // >= 3 syllables

  words.forEach(w => {
    const s = countSyllables(w);
    totalSyllables += s;
    if (s >= 3) complexWordsCount++;
  });

  const avgSentenceLength = numWords / numSentences;
  const avgSyllablesPerWord = totalSyllables / numWords;

  // 1. Flesch-Kincaid Grade Level
  const fkGrade = (0.39 * avgSentenceLength) + (11.8 * avgSyllablesPerWord) - 15.59;

  // 2. Flesch Reading Ease
  const fleschEase = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);

  // 3. Gunning Fog Index: 0.4 * ((words / sentences) + 100 * (complexWords / words))
  const gunningFog = 0.4 * (avgSentenceLength + (100 * (complexWordsCount / numWords)));

  // 4. Coleman-Liau Index: 0.0588 * L - 0.296 * S - 15.8 (L = letters per 100 words, S = sentences per 100 words)
  const L = (charactersCount / numWords) * 100;
  const S = (numSentences / numWords) * 100;
  const colemanLiau = (0.0588 * L) - (0.296 * S) - 15.8;

  // 5. Automated Readability Index (ARI): 4.71 * (chars / words) + 0.5 * (words / sentences) - 21.43
  const ari = (4.71 * (charactersCount / numWords)) + (0.5 * avgSentenceLength) - 21.43;

  // Consensus grade level
  const validGrades = [fkGrade, gunningFog, colemanLiau, ari].map(g => Math.max(1, Math.min(18, g)));
  const consensusGrade = validGrades.reduce((a, b) => a + b, 0) / validGrades.length;

  let schoolLevel = 'Elementary School';
  if (consensusGrade >= 16) schoolLevel = 'Post-Graduate / Professional';
  else if (consensusGrade >= 13) schoolLevel = 'College Undergraduate';
  else if (consensusGrade >= 9) schoolLevel = 'High School';
  else if (consensusGrade >= 6) schoolLevel = 'Middle School';

  return {
    numWords,
    numSentences,
    charactersCount,
    complexWordsCount,
    fkGrade: Math.max(1, fkGrade).toFixed(1),
    fleschEase: Math.max(0, Math.min(100, fleschEase)).toFixed(1),
    gunningFog: Math.max(1, gunningFog).toFixed(1),
    colemanLiau: Math.max(1, colemanLiau).toFixed(1),
    ari: Math.max(1, ari).toFixed(1),
    consensusGrade: consensusGrade.toFixed(1),
    schoolLevel
  };
}

export default function ReadingLevelAnalyzer() {
  const [text, setText] = useState(
    `Quantum electrodynamics is the relativistic quantum field theory of electrodynamics. In essence, it describes how light and matter interact and is the first theory where full agreement between quantum mechanics and special relativity is achieved. Physicists formulate perturbation expansions in powers of the fine-structure constant to calculate scattering cross sections with extraordinary empirical accuracy.`
  );

  const results = useMemo(() => analyzeAcademicReading(text), [text]);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold uppercase tracking-wider mb-2">
          🎓 Academic & Educational Linguistics
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Multi-Index Reading Level & Academic Grade Analyzer
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Compute Flesch-Kincaid, Gunning Fog, Coleman-Liau, and Automated Readability Index (ARI) to determine exact US grade-school reading levels.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Academic Text Input
              </label>
              <span className="text-xs text-slate-400">
                {results ? `${results.numWords} words • ${results.numSentences} sentences` : '0 words'}
              </span>
            </div>
            <textarea
              rows={10}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white leading-relaxed"
              placeholder="Paste article, thesis, or essay excerpt..."
            />
          </div>
        </div>

        {/* Multi-Index Results */}
        <div className="lg:col-span-5 space-y-4">
          {results ? (
            <>
              {/* Consensus Card */}
              <div className="bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-2xl p-5 shadow-sm space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Consensus Reading Level
                </span>
                <div className="text-3xl font-black text-slate-900 dark:text-white">
                  Grade {results.consensusGrade}
                </div>
                <div className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                  {results.schoolLevel}
                </div>
              </div>

              {/* 4 Academic Index Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                  <div className="text-xs text-slate-500">Flesch-Kincaid</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">Grade {results.fkGrade}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Syllables + sentence len</div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                  <div className="text-xs text-slate-500">Gunning Fog Index</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">Grade {results.gunningFog}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Complex polysyllables</div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                  <div className="text-xs text-slate-500">Coleman-Liau Index</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">Grade {results.colemanLiau}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Character letter counts</div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                  <div className="text-xs text-slate-500">Automated Readability (ARI)</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">Grade {results.ari}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Character per word ratio</div>
                </div>
              </div>

              {/* Flesch Reading Ease Bar */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Flesch Reading Ease</span>
                  <span className="font-bold text-slate-900 dark:text-white">{results.fleschEase} / 100</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(5, results.fleschEase))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Very Difficult (0-30)</span>
                  <span>Standard (60-70)</span>
                  <span>Very Easy (90-100)</span>
                </div>
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-sm">
              Enter at least 5 words of text to calculate grade levels.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
