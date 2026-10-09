import React, { useState, useEffect } from 'react';

const PRESETS = {
  remoteCollab: {
    title: 'Async Remote Work Tool',
    customerSegment: 'Remote Engineering & Product Teams',
    jobs: ['Coordinate sprint deliverables across 5 time zones', 'Document technical architectural decisions', 'Reduce synchronous meeting fatigue'],
    pains: ['Endless fragmented Slack threads losing context', '3-hour timezone overlap forcing late night calls', 'Miscommunication on task dependencies'],
    gains: ['Deep uninterrupted focus blocks for coding', 'Single clear written source of truth', 'Transparent asynchronous status reporting'],
    products: ['Structured Async Decision Canvas', 'Integrated Git / Linear Issue Auto-Sync', 'Automated Daily Standup Summarizer'],
    relievers: ['Thread summarization keeps context intact', 'Replaces 4 recurring weekly syncs with async sign-offs', 'Explicit dependency blockers visual graph'],
    creators: ['Provides verified 4-hour daily maker-time boost', 'Searchable decision history reduces onboarding by 50%', 'Automated sprint burndown from code commits']
  }
};

export default function ValuePropositionCanvasMapper() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('vimz_vpc_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return PRESETS.remoteCollab;
  });

  const [activeTab, setActiveTab] = useState('canvas'); // 'canvas' | 'alignment'
  const [activeCategory, setActiveCategory] = useState('jobs');
  const [inputVal, setInputVal] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('vimz_vpc_v1', JSON.stringify(data));
    } catch (e) {}
  }, [data]);

  const addPoint = (cat) => {
    if (!inputVal.trim()) return;
    setData(prev => ({
      ...prev,
      [cat]: [...(prev[cat] || []), inputVal.trim()]
    }));
    setInputVal('');
  };

  const removePoint = (cat, idx) => {
    setData(prev => ({
      ...prev,
      [cat]: prev[cat].filter((_, i) => i !== idx)
    }));
  };

  // Alignment Calculation:
  // Pain Relievers vs Pains, Gain Creators vs Gains
  const painRelieverRatio = data.pains.length > 0 ? Math.min(1, data.relievers.length / data.pains.length) : 0;
  const gainCreatorRatio = data.gains.length > 0 ? Math.min(1, data.creators.length / data.gains.length) : 0;
  const fitScore = Math.round(((painRelieverRatio * 0.5) + (gainCreatorRatio * 0.5)) * 100);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ ...data, fitScore, exportDate: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `value_proposition_canvas.json`;
    a.click();
  };

  const exportCSV = () => {
    let csv = 'Section,Type,Item\n';
    ['jobs', 'pains', 'gains'].forEach(k => {
      (data[k] || []).forEach(item => csv += `"Customer Profile","${k}","${item.replace(/"/g, '""')}"\n`);
    });
    ['products', 'relievers', 'creators'].forEach(k => {
      (data[k] || []).forEach(item => csv += `"Value Map","${k}","${item.replace(/"/g, '""')}"\n`);
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `value_proposition_canvas.csv`;
    a.click();
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Value Proposition Canvas & Problem-Solution Fit Mapper</h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
            Target Segment: <strong>{data.customerSegment}</strong> • Problem-Solution Fit Score: <strong style={{ color: fitScore > 75 ? 'var(--success, #0D9B79)' : 'var(--primary, #6C4CF1)' }}>{fitScore}%</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveTab('canvas')} className={`btn ${activeTab === 'canvas' ? 'primary' : 'sub'}`} style={{ fontSize: '0.8rem' }}>Canvas View</button>
          <button onClick={() => setActiveTab('alignment')} className={`btn ${activeTab === 'alignment' ? 'primary' : 'sub'}`} style={{ fontSize: '0.8rem' }}>Fit Analysis</button>
          <button onClick={exportJSON} className="btn sub" style={{ fontSize: '0.8rem' }}>Export JSON</button>
          <button onClick={exportCSV} className="btn sub" style={{ fontSize: '0.8rem' }}>Export CSV</button>
          <button onClick={() => window.print()} className="btn sub" style={{ fontSize: '0.8rem' }}>Print Canvas</button>
        </div>
      </div>

      {/* Quick Add Bar */}
      <div style={{ background: 'var(--card-bg)', padding: '0.9rem', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1.5rem', display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Add to:</span>
        <select
          value={activeCategory}
          onChange={(e) => setActiveCategory(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
        >
          <optgroup label="Customer Profile (Circle)">
            <option value="jobs">Customer Jobs</option>
            <option value="pains">Customer Pains</option>
            <option value="gains">Customer Gains</option>
          </optgroup>
          <optgroup label="Value Map (Square)">
            <option value="products">Products & Services</option>
            <option value="relievers">Pain Relievers</option>
            <option value="creators">Gain Creators</option>
          </optgroup>
        </select>
        <input
          type="text"
          placeholder="Enter item description..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addPoint(activeCategory)}
          style={{ flex: 1, minWidth: '220px', padding: '0.5rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
        />
        <button onClick={() => addPoint(activeCategory)} className="btn primary" style={{ padding: '0.5rem 1rem' }}>+ Add Item</button>
      </div>

      {activeTab === 'canvas' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* LEFT: THE VALUE MAP (THE SQUARE) */}
          <div style={{ background: 'var(--card-bg)', border: '2px solid var(--primary, #6C4CF1)', borderRadius: '14px', padding: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🟩</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>The Value Map (Your Offering)</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>How your product bundles create value and relieve pain</span>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ background: 'var(--bg)', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '0.4rem' }}>📦 Products & Services ({data.products.length})</div>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem' }}>
                  {data.products.map((p, i) => (
                    <li key={i} style={{ marginBottom: '0.3rem' }}>
                      {p} <button onClick={() => removePoint('products', i)} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer' }}>×</button>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ background: 'var(--bg)', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#E11D48', marginBottom: '0.4rem' }}>💊 Pain Relievers ({data.relievers.length})</div>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem' }}>
                  {data.relievers.map((r, i) => (
                    <li key={i} style={{ marginBottom: '0.3rem' }}>
                      {r} <button onClick={() => removePoint('relievers', i)} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer' }}>×</button>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ background: 'var(--bg)', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--success, #0D9B79)', marginBottom: '0.4rem' }}>⚡ Gain Creators ({data.creators.length})</div>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem' }}>
                  {data.creators.map((c, i) => (
                    <li key={i} style={{ marginBottom: '0.3rem' }}>
                      {c} <button onClick={() => removePoint('creators', i)} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer' }}>×</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* RIGHT: THE CUSTOMER PROFILE (THE CIRCLE) */}
          <div style={{ background: 'var(--card-bg)', border: '2px solid #18B6A4', borderRadius: '14px', padding: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.4rem' }}>⭕</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>The Customer Profile (User Reality)</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Jobs, anxieties, and desired outcomes of target customers</span>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ background: 'var(--bg)', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#2563EB', marginBottom: '0.4rem' }}>🎯 Customer Jobs ({data.jobs.length})</div>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem' }}>
                  {data.jobs.map((j, i) => (
                    <li key={i} style={{ marginBottom: '0.3rem' }}>
                      {j} <button onClick={() => removePoint('jobs', i)} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer' }}>×</button>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ background: 'var(--bg)', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#E11D48', marginBottom: '0.4rem' }}>😫 Customer Pains ({data.pains.length})</div>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem' }}>
                  {data.pains.map((p, i) => (
                    <li key={i} style={{ marginBottom: '0.3rem' }}>
                      {p} <button onClick={() => removePoint('pains', i)} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer' }}>×</button>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ background: 'var(--bg)', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--success, #0D9B79)', marginBottom: '0.4rem' }}>🏆 Customer Gains ({data.gains.length})</div>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem' }}>
                  {data.gains.map((g, i) => (
                    <li key={i} style={{ marginBottom: '0.3rem' }}>
                      {g} <button onClick={() => removePoint('gains', i)} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer' }}>×</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ALIGNMENT FIT ANALYSIS TAB */
        <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: fitScore > 75 ? 'var(--success, #0D9B79)' : 'var(--primary, #6C4CF1)', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 700 }}>{fitScore}%</span>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Fit Score</span>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Problem-Solution Fit Evaluation</h3>
              <p style={{ margin: '0.4rem 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>
                {fitScore >= 80 ? 'Exceptional alignment: Your pain relievers and gain creators directly map to user frictions.' :
                 fitScore >= 50 ? 'Moderate alignment: Some customer pains or gains lack clear offsetting features.' :
                 'Weak alignment: Major customer pains are unaddressed. Revisit your feature roadmap.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
              <h4 style={{ margin: '0 0 0.8rem', color: '#E11D48' }}>Pain Relief Ratio ({data.relievers.length} Relievers vs {data.pains.length} Pains)</h4>
              <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.8rem' }}>
                <div style={{ height: '100%', width: `${Math.round(painRelieverRatio * 100)}%`, background: '#E11D48' }} />
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0 }}>
                {data.relievers.length >= data.pains.length ? '✅ Every identified pain has at least one matching feature to alleviate it.' : `⚠️ You have ${data.pains.length - data.relievers.length} unaddressed customer pain point(s).`}
              </p>
            </div>

            <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
              <h4 style={{ margin: '0 0 0.8rem', color: 'var(--success, #0D9B79)' }}>Gain Creation Ratio ({data.creators.length} Creators vs {data.gains.length} Gains)</h4>
              <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.8rem' }}>
                <div style={{ height: '100%', width: `${Math.round(gainCreatorRatio * 100)}%`, background: 'var(--success, #0D9B79)' }} />
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0 }}>
                {data.creators.length >= data.gains.length ? '✅ Value proposition generates positive surplus across all desired gains.' : `⚠️ You have ${data.gains.length - data.creators.length} aspirational gains with no feature creator.`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
