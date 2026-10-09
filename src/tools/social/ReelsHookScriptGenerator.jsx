import React, { useState } from 'react';

export default function ReelsHookScriptGenerator() {
  const [niche, setNiche] = useState('Marketing & Growth');
  const [topic, setTopic] = useState('How AI is replacing manual SDR sales prospecting');
  const [hookStyle, setHookStyle] = useState('curiosity_gap');
  const [targetDuration, setTargetDuration] = useState('30s');
  const [copiedKey, setCopiedKey] = useState('');

  const hookStyles = [
    { id: 'curiosity_gap', name: 'Curiosity Gap / Secret', desc: 'Creates instant intrigue that forces viewers to watch till the reveal' },
    { id: 'contrarian', name: 'Contrarian / Hot Take', desc: 'Disproves common conventional wisdom or calls out a widespread mistake' },
    { id: 'negative_urgency', name: 'FOMO & Risk Warning', desc: 'Warns about a costly trap or wasted money/time' },
    { id: 'direct_tactical', name: 'Direct Tactical Blueprint', desc: 'Promises an immediate step-by-step actionable framework' }
  ];

  const generateScript = () => {
    const rawTopic = topic.trim() || 'How to scale your business with automated systems';

    const library = {
      curiosity_gap: {
        hooks: [
          `"Almost nobody in ${niche} is talking about this one strategy, and it completely changes everything."`,
          `"I spent the last 30 days analyzing top operators in ${niche}. Here is the secret they never share on podcasts."`,
          `"This is the exact reason 90% of people fail with ${rawTopic}—and how to fix it in 60 seconds."`
        ],
        broll: "Fast visual zoom into screen showing metrics dashboard or real analytics spike.",
        pacing: "Rapid first 3 seconds, beat drop at second 4, clean instructional flow.",
        body: [
          { time: '0:00 - 0:03', visual: 'High energy face-to-camera or dynamic screen point', script: `Stop doing ${rawTopic} the old way. There is a new shift that top teams are quietly using right now.` },
          { time: '0:03 - 0:12', visual: 'B-Roll cut to tool interface or step 1 highlight', script: `The foundational shift comes down to two key levers: removing manual steps and structuring your workflow around automated triggers.` },
          { time: '0:12 - 0:22', visual: 'Side-by-side comparison (Before vs After)', script: `Instead of spending 3 hours daily on grunt work, you deploy automated agentic loops that execute while you sleep.` },
          { time: '0:22 - 0:30', visual: 'Point to screen / Call to Action overlay', script: `Save this video right now so you don't lose the framework, and drop a comment below for the free blueprint!` }
        ]
      },
      contrarian: {
        hooks: [
          `"Stop listening to generic advice about ${rawTopic}. It is actively costing you revenue."`,
          `"Unpopular opinion: If you are still doing ${rawTopic} manually, you are wasting 80% of your time."`,
          `"Why everything you were taught about ${niche} in 2024 is completely wrong today."`
        ],
        broll: "Red warning banner overlay, dramatic hand gesture, split screen contrast.",
        pacing: "Punchy, confident delivery with aggressive jump cuts every 2 seconds.",
        body: [
          { time: '0:00 - 0:03', visual: 'Direct aggressive hook to lens', script: `Everyone is telling you to grind harder on ${rawTopic}. That is terrible advice in 2026.` },
          { time: '0:03 - 0:14', visual: 'Show graph showing diminishing returns of manual work', script: `Linear effort no longer equals exponential results. The real leverage is automated infrastructure.` },
          { time: '0:14 - 0:24', visual: '3-point numbered overlay on screen', script: `Focus on: 1. Proprietary workflows, 2. Dynamic triggers, 3. Human verification at the finish line.` },
          { time: '0:24 - 0:30', visual: 'Closing punchline + profile tap animation', script: `Share this with a friend who needs to hear this, and follow for daily high-leverage frameworks.` }
        ]
      },
      negative_urgency: {
        hooks: [
          `"If you don't fix your ${rawTopic} by next month, you're going to get left behind."`,
          `"The biggest trap costing teams thousands in ${niche} right now (and how to avoid it)."`,
          `"Check your workflow right now. If you see this mistake, stop immediately."`
        ],
        broll: "Warning siren visual effect, screenshot of error or lost revenue graph.",
        pacing: "Urgent cadence, high intensity, quick visual evidence.",
        body: [
          { time: '0:00 - 0:03', visual: 'Close up warning expression', script: `If you make this one mistake with ${rawTopic}, you are burning hours of productive output.` },
          { time: '0:03 - 0:15', visual: 'Highlight the breakdown area on screen', script: `Most people assume adding more tools fixes the problem. In reality, disconnected tools create friction.` },
          { time: '0:15 - 0:24', visual: 'Show the unified streamlined system', script: `Consolidate your pipeline into a unified engine. One trigger, full execution.` },
          { time: '0:24 - 0:30', visual: 'Bookmark icon animation', script: `Bookmark this guide so you have the checklist ready for your next sprint.` }
        ]
      },
      direct_tactical: {
        hooks: [
          `"Here is the exact 3-step playbook for ${rawTopic} that took us to the top 1%."`,
          `"Steal my exact template for ${rawTopic}. Here is how it works step by step."`,
          `"How to master ${rawTopic} in 30 seconds (bookmark this for later)." `
        ],
        broll: "Screen recording demonstrating mouse clicks, workflow editor, or code output.",
        pacing: "Crisp, educational, zero fluff, fast step transitions.",
        body: [
          { time: '0:00 - 0:03', visual: 'Bold text on screen: 3-Step Playbook', script: `Here is the exact framework to master ${rawTopic} in 3 simple steps.` },
          { time: '0:03 - 0:12', visual: 'Step 1 banner on top', script: `Step 1: Audit your existing bottlenecks and list every repetitive manual touchpoint.` },
          { time: '0:12 - 0:22', visual: 'Step 2 & 3 fast cuts', script: `Step 2: Connect automated triggers. Step 3: Run daily benchmark checks.` },
          { time: '0:22 - 0:30', visual: 'CTA screen with profile handle', script: `Comment 'PLAYBOOK' below and I'll DM you the full Notion template right away!` }
        ]
      }
    };

    return library[hookStyle] || library.curiosity_gap;
  };

  const currentScript = generateScript();

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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2">
              🎬 Viral Retention Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Reels & TikTok Hook Script Generator
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Engineer high-converting 3-second visual hooks, pacing cues, B-roll recommendations, and timed short-form scripts.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              🎥 Video Parameters
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Industry / Niche
              </label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g. B2B SaaS, E-Commerce, Fitness, Real Estate"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Specific Topic / Core Value Proposition
              </label>
              <textarea
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. How to automate SDR email prospecting using AI agent loops"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                Hook Angle & Psychology
              </label>
              <div className="space-y-2">
                {hookStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setHookStyle(style.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                      hookStyle === style.id
                        ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold">{style.name}</div>
                    <div className="text-[11px] opacity-75 mt-0.5">{style.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Output Script */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
            {/* Top Hook Variations */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                🔥 Top 3 High-Retention Hook Variations (0-3s)
              </h3>
              <div className="space-y-2">
                {currentScript.hooks.map((hook, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200"
                  >
                    <span className="pr-3 leading-relaxed">{hook}</span>
                    <button
                      onClick={() => handleCopy(hook, `hook-${idx}`)}
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 transition-colors shrink-0"
                    >
                      {copiedKey === `hook-${idx}`  ? '✓' : '📋'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Pacing & B-Roll Advice */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 rounded-xl text-xs">
              <div>
                <span className="font-bold text-rose-900 dark:text-rose-300 block mb-0.5">🎥 B-Roll Recommendation</span>
                <p className="text-slate-600 dark:text-slate-400">{currentScript.broll}</p>
              </div>
              <div>
                <span className="font-bold text-rose-900 dark:text-rose-300 block mb-0.5">⚡ Pacing & Sound Strategy</span>
                <p className="text-slate-600 dark:text-slate-400">{currentScript.pacing}</p>
              </div>
            </div>

            {/* Timed Timeline Script */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  🎬 Full 30-Second Timed Script & Visual Cue Board
                </h3>
                <button
                  onClick={() => {
                    const full = currentScript.body.map(b => `[${b.time}]\nVisual: ${b.visual}\nSpoken: ${b.script}\n`).join('\n');
                    handleCopy(full, 'full_script');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium transition-colors"
                >
                  {copiedKey === 'full_script'  ? '✓' : '📋'}
                  {copiedKey === 'full_script' ? 'Copied Full Script!' : 'Copy Entire Script'}
                </button>
              </div>

              <div className="space-y-3">
                {currentScript.body.map((segment, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                        {segment.time}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 italic">
                        👁️ {segment.visual}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white pt-1">
                      "{segment.script}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
