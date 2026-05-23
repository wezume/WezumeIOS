// Wezume primitives: logo, icons, photo cell components
// Exported to window for cross-script use.

const W_BLUE = '#1E9BD7';

// ─────────────────────────────────────────────────────────────────────
// Real Wezume logo — person-as-microphone (recreated as SVG)
// `color` is the mark color; transparent bg lets you paint it on anything.
// ─────────────────────────────────────────────────────────────────────
function WezumeLogoMark({ size = 64, color = '#fff', knockoutColor, style = {} }) {
  // knockoutColor is what shows THROUGH the tie + grille slots.
  // When painting on a colored background (e.g. blue), pass the bg color.
  const ko = knockoutColor || 'transparent';
  return (
    <svg width={size} height={size * (130/120)} viewBox="0 0 120 130" style={{ display: 'block', ...style }} aria-label="wezume">
      <defs>
        <mask id="wz-mask" maskUnits="userSpaceOnUse">
          <rect width="120" height="130" fill="black"/>
          {/* head — sits clearly above body shoulders */}
          <circle cx="60" cy="13" r="10" fill="white"/>
          {/* mic body — true capsule / cylindrical */}
          <rect x="35" y="23" width="50" height="70" rx="25" fill="white"/>
          {/* tie — thin V-collar tapering to a point mid-body */}
          <path d="M56 23 L60 30 L64 23 L62 56 L60 60 L58 56 Z" fill="black"/>
          {/* grille slots — 5 stripes each side, NEVER connecting across the tie. Solid bottom under the lowest stripe. */}
          <g fill="black">
            <rect x="37" y="36" width="20" height="3" rx="1.5"/>
            <rect x="63" y="36" width="20" height="3" rx="1.5"/>
            <rect x="37" y="44" width="20" height="3" rx="1.5"/>
            <rect x="63" y="44" width="20" height="3" rx="1.5"/>
            <rect x="37" y="52" width="20" height="3" rx="1.5"/>
            <rect x="63" y="52" width="20" height="3" rx="1.5"/>
            <rect x="37" y="60" width="20" height="3" rx="1.5"/>
            <rect x="63" y="60" width="20" height="3" rx="1.5"/>
            <rect x="37" y="68" width="20" height="3" rx="1.5"/>
            <rect x="63" y="68" width="20" height="3" rx="1.5"/>
          </g>
          {/* stand + base */}
          <rect x="56" y="93" width="8" height="14" fill="white"/>
          <rect x="38" y="105" width="44" height="6" rx="2" fill="white"/>
        </mask>
      </defs>
      {/* knockout layer (only matters if you specify one) */}
      <rect width="120" height="130" fill={ko}/>
      {/* the actual mark, with knockouts cut out */}
      <rect width="120" height="130" fill={color} mask="url(#wz-mask)"/>
    </svg>
  );
}

// Compact icon tile — used inline in headers, buttons, badges, etc.
// Default: render the pure mark (no square chip). Pass bg='#fff' etc. to wrap in a tile.
function WezumeMic({ size = 28, color = W_BLUE, bg = 'transparent', radius = 0.22 }) {
  if (bg === 'transparent' || bg === 'none') {
    return <WezumeLogoMark size={size * (120/130)} color={color}/>;
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: size * radius,
      background: bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <WezumeLogoMark size={size * 0.62} color={color}/>
    </div>
  );
}

function WezumeWordmark({ size = 22, light = false, gap = 6 }) {
  // SVG-based wordmark — sharp at every size, transparent bg, colors flex.
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap }}>
      <WezumeLogoMark size={size * 0.95} color={light ? '#fff' : W_BLUE}/>
      <span style={{
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: 600, fontSize: size, letterSpacing: '-0.005em',
        color: light ? '#fff' : W_BLUE,
      }}>wezume</span>
    </div>
  );
}

// Hero splash mark — uses the actual brand splash image (rings + circle + mic baked in)
function WezumeSplashMark({ size = 220 }) {
  return (
    <img
      src="assets/wezume-mark.jpg"
      alt="wezume"
      style={{
        width: size, height: size, display: 'block',
        borderRadius: '50%', objectFit: 'cover',
        boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
      }}
    />
  );
}

// SVG icons – stroke-based, lucide-style
const Icon = {
  mail: (p={}) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>,
  lock: (p={}) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>,
  eye: (p={}) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeoff: (p={}) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>,
  user: (p={}) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>,
  search: (p={}) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>,
  briefcase: (p={}) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/></svg>,
  play: (p={}) => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M8 5v14l11-7z"/></svg>,
  heart: (p={}) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"/></svg>,
  bell: (p={}) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>,
  arrow: (p={}) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>,
  back: (p={}) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m15 6-6 6 6 6"/></svg>,
  sparkles: (p={}) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/></svg>,
  fire: (p={}) => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2s4 4 4 8a4 4 0 1 1-8 0c0-2 1-3 1-3s-3 2-3 6a6 6 0 0 0 12 0c0-6-6-11-6-11z"/></svg>,
  link: (p={}) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 17H7a5 5 0 0 1 0-10h2"/><path d="M15 7h2a5 5 0 0 1 0 10h-2"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  globe: (p={}) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>,
  filter: (p={}) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 5h16l-6 8v6l-4-2v-4z"/></svg>,
  upload: (p={}) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 4v12M6 10l6-6 6 6M4 20h16"/></svg>,
};

// LinkedIn glyph
function LinkedInGlyph({ size = 18, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm6 0h3.8v1.6h.06c.53-.95 1.83-1.96 3.77-1.96 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.2c0-1.24-.02-2.83-1.72-2.83-1.73 0-2 1.35-2 2.74V21H9V9z"/>
    </svg>
  );
}

// A stylized portrait avatar — gradient + initials. We use these instead of real photos
// to avoid fetching assets, and they look intentional.
const AVATAR_PALETTES = [
  ['#FFB4A2','#E5989B'], ['#A8DADC','#457B9D'], ['#BDE0FE','#A2D2FF'],
  ['#CDB4DB','#FFC8DD'], ['#FFD6A5','#FDFFB6'], ['#CAFFBF','#9BF6FF'],
  ['#FFADAD','#FFD6A5'], ['#BDB2FF','#A0C4FF'], ['#FFE0AC','#FCB07E'],
  ['#9BC7FF','#5DA4F0'], ['#F8AFA6','#F49097'], ['#B7E4C7','#74C69D'],
];
function PortraitAvatar({ idx = 0, name = 'A', round = false, style = {} }) {
  const [a, b] = AVATAR_PALETTES[idx % AVATAR_PALETTES.length];
  const initial = (name || 'A').slice(0, 1).toUpperCase();
  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      borderRadius: round ? '50%' : 14,
      background: `linear-gradient(160deg, ${a} 0%, ${b} 100%)`,
      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...style,
    }}>
      {/* abstract face: shoulders + head silhouette */}
      <svg viewBox="0 0 100 140" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <ellipse cx="50" cy="55" rx="22" ry="26" fill="rgba(255,255,255,0.55)"/>
        <path d="M10 140 Q 10 95 50 90 Q 90 95 90 140 Z" fill="rgba(0,0,0,0.18)"/>
        <path d="M14 140 Q 14 100 50 96 Q 86 100 86 140 Z" fill="rgba(255,255,255,0.25)"/>
      </svg>
      <span style={{
        position: 'absolute', bottom: 6, left: 8,
        color: 'rgba(255,255,255,0.92)', fontWeight: 700, fontSize: 11,
        textShadow: '0 1px 2px rgba(0,0,0,0.25)',
      }}>{name}</span>
      {/* tiny wezume tag like in original */}
      <div style={{
        position: 'absolute', top: 6, left: 6,
        background: 'rgba(27,138,201,0.85)', color: '#fff',
        borderRadius: 999, padding: '2px 6px',
        fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3,
      }}>
        <WezumeMic size={8} color="#fff" bg="transparent"/>
        wezume
      </div>
    </div>
  );
}

const SAMPLE_NAMES = ['Aarav','Priya','Rohan','Sneha','Kavya','Arjun','Meera','Vikram','Ananya','Karthik','Diya','Ishaan','Riya','Aryan','Tara','Dev','Sara','Neil','Maya','Vivaan','Nisha','Sahil'];

Object.assign(window, {
  WezumeMic, WezumeWordmark, WezumeLogoMark, WezumeSplashMark,
  Icon, LinkedInGlyph,
  PortraitAvatar, SAMPLE_NAMES, W_BLUE,
});
