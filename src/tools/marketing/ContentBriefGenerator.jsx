import React, { useState } from 'react';

export default function ContentBriefGenerator() {
  const [briefTitle, setBriefTitle] = useState('Ultimate Guide to Cloud Cost Optimization');
  const [primaryKeyword, setPrimaryKeyword] = useState('cloud cost optimization');
  const [searchIntent, setSearchIntent] = useState('Commercial Investigation');
  const [targetAudience, setTargetAudience] = useState('DevOps Leads, VP of Engineering, Cloud Architects');
  const [targetWordCount, setTargetWordCount] = useState(2400);
  const [targetCta, setTargetCta] = useState('Download Free AWS Cost Reduction Spreadsheet / Book a Demo');

  const [secondaryKeywords, setSecondaryKeywords] = useState('aws billing alerts, cloud waste reduction, finops best practices, kubernetes cost allocation');
  const [outline, setOutline] = useState(
`## H1: The Complete Guide to Cloud Cost Optimization in 2026
## H2: What is Cloud Cost Optimization (FinOps)?
## H2: Top 5 Sources of Wasted Cloud Spend
### H3: Idle & Orphaned Compute Instances
### H3: Over-Provisioned Storage Tiers
### H3: Unmonitored Data Egress Fees
## H2: Step-by-Step 30-Day Cost Reduction Playbook
## H2: Comparing Top FinOps Tools & Native Dashboards
## H2: Frequently Asked Questions
## H2: Conclusion & Next Steps`
  );

  const [questions, setQuestions] = useState(
`- How much can companies typically save with FinOps?
- What is the difference between AWS Cost Explorer and third-party tools?
- How do reserved instances and savings plans work?`
  );

  const [guidelines, setGuidelines] = useState(
`- Avoid passive voice and generic fluff; lead with concrete metrics and dollar savings examples.
- Include at least 2 real-world architectural diagrams or workflow screenshots.
- Cite Gartner, AWS, and Cloudflare benchmarks where applicable.
- Ensure minimum 2 internal links to /tools and /pricing.`
  );

  const [copied, setCopied] = useState(false);

  const generateMarkdown = () => {
    return `# Editorial Content Brief: ${briefTitle}

**Target Primary Keyword:** \`${primaryKeyword}\`  
**Search Intent:** ${searchIntent}  
**Target Audience / Persona:** ${targetAudience}  
**Target Word Count:** ${targetWordCount} words  
**Primary Conversion CTA:** ${targetCta}  

---

### Secondary Keywords & Semantic Entities
${secondaryKeywords.split(',').map(k => `- ${k.trim()}`).join('\n')}

---

### Questions to Answer (People Also Ask / Search Intent)
${questions}

---

### Proposed Heading Outline Structure
${outline}

---

### Editorial Standards & Acceptance Criteria
${guidelines}
`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    const blob = new Blob([generateMarkdown()], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content_brief_${primaryKeyword.replace(/[^a-z0-9]/gi, '_')}.md`;
    a.click();
  };

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Content Brief & Editorial Specification Builder</h2>
          <p style={{ margin: '0.3rem 0 0', color: 'var(--muted)', fontSize: '0.85rem' }}>
            Generate structured writer specifications: keyword targets, heading outlines, questions, and editorial guardrails.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button onClick={handleCopy} className="btn sub" style={{ fontSize: '0.85rem' }}>
            {copied ? '✓ Copied Markdown' : 'Copy Brief Markdown'}
          </button>
          <button onClick={downloadMarkdown} className="btn primary" style={{ fontSize: '0.85rem' }}>
            Download .MD File
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Article Working Title:</label>
          <input
            type="text"
            value={briefTitle}
            onChange={(e) => setBriefTitle(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          />
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Primary Focus Keyword:</label>
          <input
            type="text"
            value={primaryKeyword}
            onChange={(e) => setPrimaryKeyword(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          />
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Search Intent:</label>
          <select
            value={searchIntent}
            onChange={(e) => setSearchIntent(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          >
            <option>Informational (How-to / Guide)</option>
            <option>Commercial Investigation (Best / Comparison)</option>
            <option>Transactional (Direct Purchase / Sign-up)</option>
            <option>Navigational (Brand Login / Portal)</option>
          </select>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Target Word Count:</label>
          <input
            type="number"
            step="100"
            value={targetWordCount}
            onChange={(e) => setTargetWordCount(Number(e.target.value))}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          />
        </div>
      </div>

      {/* Deep Specification Fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.2rem' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>Target Audience & Reader Persona:</label>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', marginBottom: '1rem' }}
          />

          <label style={{ fontSize: '0.9rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>Secondary Keywords (Comma-Separated):</label>
          <textarea
            rows="3"
            value={secondaryKeywords}
            onChange={(e) => setSecondaryKeywords(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          />
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.2rem' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>Primary Call-to-Action (CTA):</label>
          <input
            type="text"
            value={targetCta}
            onChange={(e) => setTargetCta(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', marginBottom: '1rem' }}
          />

          <label style={{ fontSize: '0.9rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>Key Questions to Answer (People Also Ask):</label>
          <textarea
            rows="3"
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          />
        </div>
      </div>

      {/* Heading Outline & Standards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.2rem' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>Recommended Outline (H2 / H3 Hierarchy):</label>
          <textarea
            rows="10"
            value={outline}
            onChange={(e) => setOutline(e.target.value)}
            style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.85rem', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          />
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.2rem' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>Editorial Guardrails & Quality Standards:</label>
          <textarea
            rows="10"
            value={guidelines}
            onChange={(e) => setGuidelines(e.target.value)}
            style={{ width: '100%', fontSize: '0.85rem', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          />
        </div>
      </div>
    </div>
  );
}
