import React, { useState } from 'react';

const HOOK_PRESETS = [
  { type: 'Curiosity Gap', hookText: 'Stop scrolling if you are still doing [Topic] the old way...', visual: 'Rapid text flashing with headshake' },
  { type: 'Contrarian / Hot Take', hookText: 'Most people think [Common Belief], but that is actually killing your results...', visual: 'Pointing to screenshot evidence' },
  { type: 'The Secret / Insider', hookText: 'I spent 40 hours testing [Tool/Process] so you don’t have to. Here is what actually happened...', visual: 'Before / After split screen' },
  { type: 'Mistake Avoidance', hookText: 'The #1 mistake people make when trying to [Goal] in 2026...', visual: 'Dramatic zoom on mistake document' }
];

export default function ShortVideoSoundHookPlanner() {
  const [platform, setPlatform] = useState('TikTok & Reels');
  const [hookType, setHookType] = useState('Curiosity Gap');
  const [hookText, setHookText] = useState(HOOK_PRESETS[0].hookText);
  const [visualAction, setVisualAction] = useState(HOOK_PRESETS[0].visual);
  const [audioStyle, setAudioStyle] = useState('Trending Upbeat Lo-Fi Beat with Crisp Spoken Voiceover');

  const [bodyScript, setBodyScript] = useState('Explain the 3 primary steps clearly. Step 1: Set up the basic foundation. Step 2: Avoid common pitfalls. Step 3: Accelerate output using this specific shortcut.');
  const [ctaScript, setCtaScript] = useState('Save this video for later and check the link in my bio for the complete free template!');

  const applyPreset = (preset) => {
    setHookType(preset.type);
    setHookText(preset.hookText);
    setVisualAction(preset.visual);
  };

  // Word count & duration estimation (assuming ~150 words per minute = 2.5 words/sec)
  const totalScriptText = `${hookText} ${bodyScript} ${ctaScript}`;
  const totalWords = totalScriptText.trim().split(/\s+/).filter(Boolean).length;
  const estSeconds = Math.round(totalWords / 2.5);

  const exportScript = () => {
    const text = `# Short-Form Video Script & Hook Plan (${platform})\n\n` +
      `Estimated Duration: ~${estSeconds} seconds (${totalWords} words)\n` +
      `Audio Vibe: ${audioStyle}\n\n` +
      `## 1. The 3-Second Hook (${hookType})\n` +
      `- Audio/Spoken: "${hookText}"\n` +
      `- Visual Action: ${visualAction}\n\n` +
      `## 2. Retention Body (Value Delivery)\n` +
      `${bodyScript}\n\n` +
      `## 3. Call-To-Action (CTA)\n` +
      `"${ctaScript}"\n`;

    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `short_video_script.md`;
    a.click();
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Short-Form Video Hook & Sound Script Planner</h2>
          <p style={{ margin: '0.3rem 0 0', color: 'var(--muted)', fontSize: '0.85rem' }}>
            Architect high-retention 3-second hooks, audio sync pacing, and TikTok/Reels/Shorts scripts.
          </p>
        </div>
        <button onClick={exportScript} className="btn sub" style={{ fontSize: '0.85rem' }}>Export Script Sheet</button>
      </div>

      {/* Timing Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--card-bg)', border: '2px solid var(--primary, #6C4CF1)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>Estimated Video Duration</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>~{estSeconds} Seconds</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Ideal pacing for 85%+ completion rate</div>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Total Word Count</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)' }}>{totalWords} Words</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>At 150 words/minute spoken cadence</div>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Target Platform</div>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            style={{ width: '100%', marginTop: '0.4rem', padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontWeight: 600 }}
          >
            <option>TikTok & Reels</option>
            <option>YouTube Shorts</option>
            <option>LinkedIn Video</option>
          </select>
        </div>
      </div>

      {/* 3-Second Hook Builder */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <strong style={{ fontSize: '1.05rem', color: '#E11D48' }}>⚡ Phase 1: The 0–3s Visual & Audio Hook</strong>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {HOOK_PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => applyPreset(p)}
                style={{ fontSize: '0.75rem', background: hookType === p.type ? 'var(--primary)' : 'var(--bg)', color: hookType === p.type ? '#fff' : 'var(--text)', border: '1px solid var(--border)', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer' }}
              >
                {p.type}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Spoken Hook Text:</label>
            <textarea
              rows="3"
              value={hookText}
              onChange={(e) => setHookText(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Visual Pattern Interrupt (Camera Action):</label>
            <textarea
              rows="3"
              value={visualAction}
              onChange={(e) => setVisualAction(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
            />
          </div>
        </div>
      </div>

      {/* Body & CTA */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.2rem' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem' }}>
          <strong style={{ fontSize: '1.05rem', display: 'block', marginBottom: '0.8rem' }}>📦 Phase 2: Retention Body (Value Delivery)</strong>
          <textarea
            rows="6"
            value={bodyScript}
            onChange={(e) => setBodyScript(e.target.value)}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '0.9rem' }}
          />
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem' }}>
          <strong style={{ fontSize: '1.05rem', display: 'block', marginBottom: '0.8rem', color: 'var(--success, #0D9B79)' }}>🎯 Phase 3: Final Call to Action</strong>
          <textarea
            rows="6"
            value={ctaScript}
            onChange={(e) => setCtaScript(e.target.value)}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '0.9rem' }}
          />
        </div>
      </div>
    </div>
  );
}
