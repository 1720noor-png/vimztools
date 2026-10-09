import React, {useState } from 'react';

export default function PodcastShowNotesGenerator() {
  const [episodeTitle, setEpisodeTitle] = useState('Ep 84: Autonomous AI Workflows & The Future of High-Leverage Teams');
  const [guestName, setGuestName] = useState('Dr. Marcus Vance (Founder @ NeuroScale)');
  const [rawSummary, setRawSummary] = useState(`In this episode, Marcus explains why standard chat-based LLM prompts are becoming obsolete in enterprise environments. We discuss the rise of multi-agent architectures, why domain-specific clean data pipelines are the true moat, and the 3 key mistakes founders make when trying to automate operations.`);
  const [copied, setCopied] = useState(false);

  const generateNotes = () => {
    return `🎙️ SHOW NOTES: ${episodeTitle}
Guest: ${guestName}

📝 EPISODE OVERVIEW:
${rawSummary}

🔑 KEY TAKEAWAYS & HIGHLIGHTS:
• The Shift from Chatbots to Agents: Why single prompt interfaces fail at complex workflows.
• The 80/20 Automation Principle: Automating mechanical tasks so human experts focus on leverage.
• Benchmark Evaluation Loops: How to catch errors and hallucinations before production delivery.

⏱️ TIMESTAMPS & CHAPTERS:
00:00 - Welcome & Guest Introduction
03:15 - Why Chatbots Are Becoming Obsolete
08:40 - Building The Proprietary Data Moat
14:20 - Multi-Agent System Architecture Walkthrough
22:10 - Avoiding Common Automation Traps
28:45 - Final Advice & Where to Connect

🔗 CONNECT & RESOURCES:
• Guest: ${guestName}
• Platform: https://vimz.ai

👉 If you enjoyed this episode, please leave a 5-star rating and subscribe!`;
  };

  const output = generateNotes();

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-semibold uppercase tracking-wider mb-2">
              🎙️ Audio & Podcasting
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Podcast Show Notes & Chapter Formatter
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Structure comprehensive episode descriptions, bulleted key takeaways, guest bios, and YouTube/Spotify chapter timestamps.
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            {copied  ? '✓' : '📋'}
            {copied ? 'Copied Show Notes!' : 'Copy Show Notes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Episode Title</label>
              <input type="text" value={episodeTitle} onChange={(e) => setEpisodeTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Guest Details</label>
              <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Episode Summary / Transcript Notes</label>
              <textarea rows={6} value={rawSummary} onChange={(e) => setRawSummary(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs resize-none" />
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Formatted Show Notes Output
            </h3>
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 font-sans text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-[450px] overflow-y-auto">
              {output}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
