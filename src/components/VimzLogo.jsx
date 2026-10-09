export default function VimzLogo({ size = 'md', iconOnly = false, className = '' }) {
  const iconSizes = {
    sm: 26,
    md: 34,
    lg: 44,
    xl: 56,
  }
  const s = typeof size === 'number' ? size : iconSizes[size] || 34

  return (
    <div className={`vimz-brand-logo ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
      <svg
        width={s}
        height={s}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="vimzGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B5FFF" />
            <stop offset="60%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="vimzGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00C48C" />
            <stop offset="100%" stopColor="#0B5FFF" />
          </linearGradient>
          <filter id="vimzShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0B5FFF" floodOpacity="0.28" />
          </filter>
        </defs>

        {/* Outer Rounded Container with subtle border glow */}
        <rect width="40" height="40" rx="11" fill="url(#vimzGrad1)" filter="url(#vimzShadow)" />
        
        {/* Subtle geometric surface highlight */}
        <rect x="1" y="1" width="38" height="38" rx="10" stroke="rgba(255,255,255,0.22)" strokeWidth="1" fill="none" />

        {/* Clean Modern Geometric "V" with AI Node Accent */}
        <path
          d="M10 12 L19 29 C19.5 30 20.5 30 21 29 L30 12 C30.6 10.9 29.8 9.5 28.5 9.5 C27.8 9.5 27.2 9.9 26.8 10.6 L20 23.5 L13.2 10.6 C12.8 9.9 12.2 9.5 11.5 9.5 C10.2 9.5 9.4 10.9 10 12 Z"
          fill="#FFFFFF"
        />

        {/* Sparkling AI Core dot in the vertex */}
        <circle cx="20" cy="15" r="2.2" fill="#67E8F9" />
      </svg>

      {!iconOnly && (
        <span className="vimz-wordmark" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: s >= 44 ? '1.65rem' : s >= 34 ? '1.28rem' : '1.05rem', letterSpacing: '-0.025em', color: 'var(--fg)', lineHeight: 1 }}>
          Vimz<span style={{ background: 'linear-gradient(120deg, #0B5FFF, #6366F1, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginLeft: '1px' }}>.ai</span>
        </span>
      )}
    </div>
  )
}
