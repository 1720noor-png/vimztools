import React, { useState } from 'react';

const INITIAL_SCHEDULE = [
  { day: 'Monday', platform: 'LinkedIn', format: 'Carousel / PDF', hook: '5 mistakes junior engineering managers make in their first 90 days', time: '08:30 AM', status: 'Ready' },
  { day: 'Tuesday', platform: 'X / Twitter', format: 'Thread (7 tweets)', hook: 'How we scaled our background task queue from 10k to 2M jobs/day', time: '11:00 AM', status: 'Drafting' },
  { day: 'Wednesday', platform: 'YouTube', format: 'Full Video', hook: 'Building a Full-Stack AI Tool Suite with React and PostgreSQL', time: '02:00 PM', status: 'Scheduled' },
  { day: 'Thursday', platform: 'Instagram', format: 'Reel / 9:16 Video', hook: 'Stop using basic spreadsheets for SaaS CAC payback calculations', time: '06:00 PM', status: 'Ready' },
  { day: 'Friday', platform: 'Newsletter', format: 'Email Article', hook: 'The Friday Product Breakdown: Lessons from high-growth micro-SaaS', time: '09:00 AM', status: 'Drafting' },
  { day: 'Saturday', platform: 'TikTok', format: 'Short Video', hook: 'POV: You discover 1,000+ developer tools in one clean web app', time: '01:30 PM', status: 'Idea' },
  { day: 'Sunday', platform: 'LinkedIn', format: 'Thought Leadership', hook: 'Weekly reflection: Why simplicity is the ultimate engineering moat', time: '07:00 PM', status: 'Drafting' }
];

export default function ContentCalendarPlanner() {
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
  const [copied, setCopied] = useState(false);

  const updateItem = (index, field, value) => {
    setSchedule(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const getCsvExport = () => {
    const headers = ['Day', 'Platform', 'Format', 'Hook / Topic', 'Publish Time', 'Status'];
    const rows = schedule.map(item => [
      `"${item.day}"`,
      `"${item.platform}"`,
      `"${item.format}"`,
      `"${item.hook.replace(/"/g, '""')}"`,
      `"${item.time}"`,
      `"${item.status}"`
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  };

  const downloadCsv = () => {
    const csvContent = getCsvExport();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly-content-calendar-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copySchedule = () => {
    const text = schedule.map(s => `[${s.day}] (${s.platform} - ${s.format} @ ${s.time}) [${s.status}]\nTopic: ${s.hook}\n`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-semibold uppercase tracking-wider mb-2">
              📅 Social Media Operations
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              7-Day Social Media Content Calendar Planner
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Plan and coordinate multi-platform weekly publishing across LinkedIn, X, YouTube, TikTok, and Newsletters.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copySchedule}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              {copied ? '✓ Copied' : '📋 Copy Plan'}
            </button>
            <button
              onClick={downloadCsv}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              📥 Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Days Grid */}
      <div className="space-y-4">
        {schedule.map((item, idx) => (
          <div
            key={item.day}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-28 text-sm font-bold text-slate-900 dark:text-white">
                  {item.day}
                </span>
                <select
                  value={item.platform}
                  onChange={(e) => updateItem(idx, 'platform', e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="X / Twitter">X / Twitter</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Newsletter">Newsletter</option>
                </select>
                <input
                  type="text"
                  value={item.format}
                  onChange={(e) => updateItem(idx, 'format', e.target.value)}
                  placeholder="Format (e.g. Carousel)"
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={item.time}
                  onChange={(e) => updateItem(idx, 'time', e.target.value)}
                  placeholder="Time"
                  className="w-24 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white text-center"
                />
                <select
                  value={item.status}
                  onChange={(e) => updateItem(idx, 'status', e.target.value)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                    item.status === 'Ready'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                      : item.status === 'Scheduled'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                      : item.status === 'Drafting'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <option value="Idea">Idea</option>
                  <option value="Drafting">Drafting</option>
                  <option value="Ready">Ready</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                Hook / Core Topic / Key Takeaway:
              </label>
              <input
                type="text"
                value={item.hook}
                onChange={(e) => updateItem(idx, 'hook', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
