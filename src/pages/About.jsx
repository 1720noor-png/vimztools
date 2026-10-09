import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link> / <span>About</span>
      </nav>

      <section className="section-head">
        <div>
          <span className="eyebrow-sm">Platform</span>
          <h1>About Vimz.ai</h1>
          <p>The web's most extensive library of 1,000+ privacy-first utility tools and AI workspace.</p>
        </div>
      </section>

      <div className="panel" style={{ lineHeight: 1.8 }}>
        <h3>100% Client-Side Privacy</h3>
        <p>
          At Vimz.ai, privacy is our foundational architecture. Every single one of our 1,000+ tools executes entirely within your browser using modern Web APIs and client-side processing. 
        </p>
        <p>
          Whether you are formatting source code, calculating financial valuations, generating cryptographic keys, or drafting business contracts, <strong>your data never leaves your computer</strong>. No forced cloud tracking, and no external storage of your private documents.
        </p>

        <h3 style={{ marginTop: '2rem' }}>Comprehensive Tool Ecosystem</h3>
        <p>
          From mathematical and scientific solvers to developer utilities, business metrics, design helpers, and everyday life organizers, Vimz.ai replaces hundreds of fragmented ad-ridden websites with one unified, blazing-fast, and distraction-free workspace.
        </p>

        <h3 style={{ marginTop: '2rem' }}>Key Guarantees</h3>
        <ul style={{ paddingLeft: '1.4rem' }}>
          <li><strong>Zero Subscriptions:</strong> No recurring commitments or paywalls for core utilities.</li>
          <li><strong>No Server Logs:</strong> Complete zero-knowledge local client execution for standard computations.</li>
          <li><strong>Lightning Fast:</strong> Instant load times powered by Vite, React, and global CDN caching.</li>
          <li><strong>Universal Access:</strong> Fully responsive interface designed for desktop, tablet, and mobile devices.</li>
        </ul>
      </div>
    </div>
  )
}
