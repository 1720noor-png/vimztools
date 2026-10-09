import React, { useState } from 'react';

export default function ContentEditorialCalendar() {
  const [copied, setCopied] = useState(false);
  const [filterPillar, setFilterPillar] = useState('All');

  const [items, setItems] = useState([
    { id: '1', date: '2026-03-16', title: 'Why Foundational LLMs Are Commoditized', pillar: 'Thought Leadership', channel: 'LinkedIn', status: 'Drafting' },
    { id: '2', date: '2026-03-18', title: '3-Step AI Workflow Demo & Screen Recording', pillar: 'Product / Demo', channel: 'YouTube / Reels', status: 'Ready' },
    { id: '3', date: '2026-03-20', title: 'Weekly Growth Framework Newsletter #42', pillar: 'Newsletter', channel: 'Substack', status: 'Scheduled' },
    { id: '4', date: '2026-03-23', title: 'Autonomous Agent Architecture Breakdown', pillar: 'Engineering', channel: 'X / Twitter', status: 'Idea' },
    { id: '5', date: '2026-03-25', title: 'Customer Case Study: 4.2x ROI Automation', pillar: 'Social Proof', channel: 'Blog / Web', status: 'Drafting' },
  ]);

  const pillars = ['All', 'Thought Leadership', 'Product / Demo', 'Newsletter', 'Engineering', 'Social Proof'];

  const addItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      title: 'New Content Piece',
      pillar: 'Thought Leadership',
      channel: 'LinkedIn',
      status: 'Idea'
    }]);
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(it => it.id === id ? { ...it, [field]: value } : it));
  };

  const deleteItem = (id) => {
    setItems(items.filter(it => it.id !== id));
  };

  const filteredItems = filterPillar === 'All' ? items : items.filter(it => it.pillar === filterPillar);

  const exportCSV = () => {
    let csv = 'Publish Date,Content Title,Pillar / Category,Channel,Production Status\n';
    items.forEach(it => {
      csv += `"${it.date}","${it.title}","${it.pillar}","${it.channel}","${it.status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `content-calendar-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-semibold uppercase tracking-wider mb-2">
              📅 Editorial Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Content Editorial Matrix & Publishing Calendar
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Plan, organize, and orchestrate cross-platform content pipelines across thematic pillars and publishing schedules.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addItem}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              ➕ Add Content Item
            </button>
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-colors"
            >
              📥 Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-2">
          ⚡ Filter Pillar:
        </span>
        {pillars.map(p => (
          <button
            key={p}
            onClick={() => setFilterPillar(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterPillar === p
                ? 'bg-teal-600 text-white shadow-2xs font-semibold'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Calendar List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        {filteredItems.map(it => (
          <div key={it.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 items-center">
            <div className="md:col-span-2">
              <input
                type="date"
                value={it.date}
                onChange={(e) => updateItem(it.id, 'date', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
              />
            </div>
            <div className="md:col-span-4">
              <input
                type="text"
                value={it.title}
                onChange={(e) => updateItem(it.id, 'title', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
              />
            </div>
            <div className="md:col-span-2">
              <input
                type="text"
                value={it.pillar}
                onChange={(e) => updateItem(it.id, 'pillar', e.target.value)}
                placeholder="Pillar"
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>
            <div className="md:col-span-2">
              <input
                type="text"
                value={it.channel}
                onChange={(e) => updateItem(it.id, 'channel', e.target.value)}
                placeholder="Channel"
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>
            <div className="md:col-span-2 flex items-center justify-between gap-2">
              <select
                value={it.status}
                onChange={(e) => updateItem(it.id, 'status', e.target.value)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                  it.status === 'Scheduled' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                  it.status === 'Ready' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' :
                  it.status === 'Drafting' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
                  'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <option value="Idea">💡 Idea</option>
                <option value="Drafting">✍️ Drafting</option>
                <option value="Ready">✅ Ready</option>
                <option value="Scheduled">🚀 Scheduled</option>
              </select>
              <button
                onClick={() => deleteItem(it.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
