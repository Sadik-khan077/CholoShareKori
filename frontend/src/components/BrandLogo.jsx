// Handcrafted human brand mark and lockup for CholoShareKori (চলো শেয়ার করি)
// Depicts two stylized connecting hands embracing in mutual campus support

export const BrandMark = ({ size = 36 }) => {
  return (
    <div 
      style={{ 
        position: 'relative', 
        width: size, 
        height: size, 
        display: 'inline-flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexShrink: 0
      }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 44 44" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'relative', zIndex: 1, filter: 'drop-shadow(0 2px 6px rgba(217, 83, 47, 0.2))' }}
      >
        <defs>
          <linearGradient id="cskGradWarmLeft" x1="6" y1="12" x2="26" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D9532F" />
            <stop offset="1" stopColor="#C44322" />
          </linearGradient>

          <linearGradient id="cskGradWarmRight" x1="38" y1="32" x2="18" y2="10" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D97706" />
            <stop offset="1" stopColor="#257A54" />
          </linearGradient>
          
          <linearGradient id="cskWarmHeart" x1="22" y1="14" x2="22" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E59E37" />
            <stop offset="1" stopColor="#D9532F" />
          </linearGradient>
        </defs>

        {/* Tactile Terracotta Squircle Badge */}
        <rect 
          x="2" 
          y="2" 
          width="40" 
          height="40" 
          rx="12" 
          fill="var(--bg-surface-subtle)" 
          stroke="var(--border-subtle)" 
          strokeWidth="1.2" 
        />

        {/* Left Giving Hand Arch (Baked Terracotta) */}
        <path 
          d="M10 24C10 18.5 14.5 14 20 14C23 14 25.5 15.5 27 17.5L24 20.5C23 19.5 21.6 18.8 20 18.8C17.1 18.8 14.8 21.1 14.8 24C14.8 25.8 15.7 27.4 17.1 28.3L15 31.2C12 29.5 10 27 10 24Z" 
          fill="url(#cskGradWarmLeft)" 
        />

        {/* Right Receiving Hand Arch (Botanical Forest to Warm Ochre) */}
        <path 
          d="M34 20C34 25.5 29.5 30 24 30C21 30 18.5 28.5 17 26.5L20 23.5C21 24.5 22.4 25.2 24 25.2C26.9 25.2 29.2 22.9 29.2 20C29.2 18.2 28.3 16.6 26.9 15.7L29 12.8C32 14.5 34 17 34 20Z" 
          fill="url(#cskGradWarmRight)" 
        />

        {/* Central Mutual Trust Node */}
        <circle cx="22" cy="22" r="3.2" fill="url(#cskWarmHeart)" />
        <circle cx="22" cy="22" r="5" stroke="var(--accent-primary)" strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="1 2" />
      </svg>
    </div>
  );
};

export const BrandLockup = ({ compact = false }) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
      <BrandMark size={compact ? 32 : 38} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
        <div style={{ 
          fontFamily: "var(--font-display)", 
          fontWeight: 700, 
          fontSize: compact ? '1.15rem' : '1.3rem',
          letterSpacing: '-0.025em',
          color: 'var(--text-main)',
          display: 'flex',
          alignItems: 'baseline',
          gap: '0.2rem'
        }}>
          <span>CholoShare</span>
          <span style={{ 
            color: 'var(--accent-primary)',
            fontStyle: 'italic'
          }}>Kori</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
          <span style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-emerald)',
            boxShadow: '0 0 6px rgba(37, 122, 84, 0.4)'
          }} />
          <span style={{ 
            fontFamily: "var(--font-body)", 
            fontSize: '0.72rem', 
            fontWeight: 600, 
            letterSpacing: '0.02em',
            color: 'var(--text-muted)' 
          }}>
            JU Campus Collective • চলো শেয়ার করি
          </span>
        </div>
      </div>
    </div>
  );
};

export default BrandLockup;
