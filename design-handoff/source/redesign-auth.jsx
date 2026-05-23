// Jobseeker redesign — all screens, based on real Wezume app flow
// Wezume brand blue confirmed from screenshots: #1E9BD7 (primary), #0B2138 (deep nav)

const { WezumeMic, WezumeWordmark, Icon, LinkedInGlyph, PortraitAvatar, SAMPLE_NAMES } = window;

const WZ = {
  // Premium blue scale — derived from real Wezume #1E9BD7
  blue50:  '#E8F4FB',
  blue100: '#C9E5F4',
  blue200: '#8FCFEB',
  blue300: '#52B5E0',
  blue:    '#1E9BD7',      // primary
  blue600: '#1577B0',      // pressed
  blueDark: '#1577B0',     // alias
  blue700: '#0E5A8E',
  blueDeep: '#0E5A8E',     // alias
  blue800: '#093E66',
  blue900: '#06243F',
  navy:    '#0B2138',      // AI Review bg
  navySoft:'#1A2F47',
  midnight:'#040D1A',      // deepest base

  bg: '#F4F8FC',
  ink: '#0B1623',
  ink2: '#4A5A70',
  ink3: '#8B97A8',
  line: '#E5ECF3',
  card: '#FFFFFF',

  yellow: '#FFC93A',
  green: '#2CC6A1',
  coral: '#FF6B6B',
  amber: '#FFB020',

  // Premium gradients — used for heroes, surfaces, FABs
  gradHero:      'linear-gradient(160deg, #2AB6EE 0%, #1E9BD7 38%, #0E5A8E 100%)',
  gradHeroDeep:  'linear-gradient(165deg, #1E9BD7 0%, #0E5A8E 50%, #06243F 100%)',
  gradMidnight:  'linear-gradient(170deg, #06243F 0%, #093E66 40%, #040D1A 100%)',
  gradPrimary:   'linear-gradient(180deg, #2AA9E5 0%, #1577B0 100%)',
  gradGlass:     'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%)',
};

// ─────────────────────────────────────────────
// Shared phone chrome + headers
// ─────────────────────────────────────────────
function WzPhoneStatus({ dark = false }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 40,
      height: 50, padding: '18px 28px 0',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      color: dark ? '#fff' : '#fff',
      fontFamily: '-apple-system, system-ui', fontWeight: 600, fontSize: 15,
      pointerEvents: 'none',
    }}>
      <span>9:41</span>
      <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4.5" y="5" width="3" height="6" rx="0.5"/><rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/><rect x="13.5" y="0" width="3" height="11" rx="0.5"/></svg>
        <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor"><path d="M7.5 2.8c2 0 3.9.8 5.2 2.2l.9-.9C12 2.5 9.9 1.5 7.5 1.5S3 2.5 1.4 4.1l.9.9C3.6 3.6 5.5 2.8 7.5 2.8z"/><circle cx="7.5" cy="9" r="1.3"/></svg>
        <span style={{ fontSize: 12, padding: '1px 5px', border: '1.2px solid currentColor', borderRadius: 4, opacity: 0.95 }}>93</span>
      </span>
    </div>
  );
}

function WzInput({ icon, placeholder, value = '', type = 'text', dark, trailing }) {
  return (
    <div style={{ position: 'relative', marginBottom: 12 }}>
      {icon && (
        <div style={{
          position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
          color: dark ? 'rgba(255,255,255,0.55)' : WZ.ink3,
          display: 'flex',
        }}>{icon}</div>
      )}
      <input
        readOnly type={type} defaultValue={value} placeholder={placeholder}
        style={{
          width: '100%', height: 52, borderRadius: 14,
          border: dark ? '1px solid rgba(255,255,255,0.12)' : `1.5px solid ${WZ.line}`,
          background: dark ? 'rgba(255,255,255,0.06)' : '#fff',
          padding: icon ? '0 16px 0 46px' : '0 16px',
          fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 15,
          color: dark ? '#fff' : WZ.ink, outline: 'none',
        }}
      />
      {trailing && (
        <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: dark ? 'rgba(255,255,255,0.55)' : WZ.ink3 }}>
          {trailing}
        </div>
      )}
    </div>
  );
}

function WzPrimaryBtn({ children, full = true, style = {}, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: full ? '100%' : 'auto',
      height: 52, borderRadius: 14, border: 0,
      background: `linear-gradient(180deg, #2AA9E5 0%, ${WZ.blueDark} 100%)`,
      color: '#fff', fontWeight: 700, fontSize: 15,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      cursor: 'pointer',
      boxShadow: `0 1px 0 rgba(255,255,255,0.4) inset, 0 10px 24px ${WZ.blue}45`,
      ...style,
    }}>{children}</button>
  );
}

// Pattern background — subtle, matches their doodle pattern but more refined
function WzPatternBg({ opacity = 0.45, dark = false }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, opacity,
      backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'><g fill='none' stroke='" + (dark ? 'white' : 'white') + "' stroke-opacity='0.4' stroke-width='1.3' stroke-linecap='round' stroke-linejoin='round'><circle cx='32' cy='32' r='10'/><path d='M30 28v8M34 28v8'/><circle cx='98' cy='66' r='13'/><path d='M94 60l8 8M102 60l-8 8'/><rect x='162' y='32' width='28' height='22' rx='3'/><path d='M170 32v-4h12v4'/><path d='M28 110l8 -8 8 8 8 -8 8 8'/><circle cx='140' cy='118' r='11'/><path d='M135 118l4 4 6 -8'/><rect x='192' y='98' width='24' height='30' rx='3'/><path d='M198 108h12M198 116h12M198 124h8'/><path d='M52 182l6 -10 6 10 6 -16 6 16'/><circle cx='118' cy='192' r='10'/><rect x='168' y='168' width='32' height='24' rx='3'/><path d='M173 176h22M173 182h22M173 188h14'/></g></svg>\")",
    }}/>
  );
}

// 5 roles, grouped by intent
const ROLES = [
  // BUILDING side — people creating their story
  { id: 'jobseeker',    group: 'build', label: 'Jobseeker',    sub: 'Land your next role',   emoji: '🎤', color: '#FF6B6B' },
  { id: 'freelancer',   group: 'build', label: 'Freelancer',   sub: 'Show your craft',       emoji: '⚡', color: '#FFB020' },
  { id: 'entrepreneur', group: 'build', label: 'Entrepreneur', sub: 'Pitch your venture',    emoji: '🚀', color: '#2CC6A1' },
  // HIRING side — people finding talent / capital
  { id: 'recruiter',    group: 'hire',  label: 'Recruiter',    sub: 'Hire by vibe',          emoji: '💼', color: '#6B6BFF' },
  { id: 'investor',     group: 'hire',  label: 'Investor',     sub: 'Back the next one',     emoji: '💰', color: '#1E9BD7' },
];

// Role tile — compact, used in signup flows
function RoleTile({ role, selected, onClick, compact = false }) {
  return (
    <button onClick={onClick} style={{
      padding: compact ? '10px 8px' : '12px 10px',
      borderRadius: 14, cursor: 'pointer',
      background: selected ? role.color : '#fff',
      color: selected ? '#fff' : WZ.ink,
      border: selected ? `2px solid ${role.color}` : `1.5px solid ${WZ.line}`,
      boxShadow: selected ? `0 10px 24px ${role.color}50` : 'none',
      textAlign: 'left', transition: 'all .15s',
      position: 'relative', overflow: 'hidden',
      transform: selected ? 'translateY(-2px)' : 'none',
    }}>
      <div style={{ fontSize: compact ? 18 : 20, marginBottom: 4 }}>{role.emoji}</div>
      <div style={{ fontSize: compact ? 12 : 13, fontWeight: 800, letterSpacing: '-0.01em' }}>{role.label}</div>
      <div style={{ fontSize: 10, opacity: 0.8, marginTop: 1 }}>{role.sub}</div>
      {selected && (
        <div style={{
          position: 'absolute', top: 8, right: 8,
          width: 16, height: 16, borderRadius: '50%', background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={role.color} strokeWidth="4"><path d="M5 12l5 5 9-12"/></svg>
        </div>
      )}
    </button>
  );
}

// ═════════════════════════════════════════════
// 1. LOGIN — refined
// ═════════════════════════════════════════════
function NewLogin() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#fff', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <WzPhoneStatus/>
      {/* Hero — premium multi-stop blue + glow blobs + concentric-ring logo */}
      <div style={{
        position: 'relative', height: 320,
        background: WZ.gradHeroDeep,
        borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* atmospheric glow blobs */}
        <div style={{ position: 'absolute', top: -80, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(82,181,224,0.55) 0%, transparent 65%)', filter: 'blur(8px)' }}/>
        <div style={{ position: 'absolute', bottom: -60, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(143,207,235,0.4) 0%, transparent 65%)', filter: 'blur(10px)' }}/>
        <WzPatternBg opacity={0.22}/>

        {/* concentric-ring logo (matches real Wezume splash) */}
        <div style={{ position: 'relative', marginTop: 18, animation: 'w-bob 3.6s ease-in-out infinite' }}>
          <window.WezumeSplashMark size={150} ringColor="rgba(255,255,255,0.20)" innerBg="#fff" innerColor={WZ.blue}/>
        </div>

        <div style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          color: '#fff', fontSize: 30, fontWeight: 600, marginTop: 14, letterSpacing: '-0.01em',
        }}>wezume</div>
        <div style={{ color: 'rgba(255,255,255,0.78)', fontSize: 12, fontWeight: 500, marginTop: 2, letterSpacing: '0.04em' }}>
          your voice. your story. one tap.
        </div>
      </div>

      {/* Form */}
      <div style={{ flex: 1, padding: '22px 24px 24px', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <div className="font-display" style={{ fontSize: 26, fontWeight: 700, color: WZ.ink, letterSpacing: '-0.02em' }}>
          Welcome back 👋
        </div>
        <div style={{ color: WZ.ink2, fontSize: 13, marginTop: 4, marginBottom: 18 }}>
          Sign in to keep building your wezume.
        </div>

        <WzInput icon={Icon.mail()} placeholder="Email"/>
        <WzInput icon={Icon.lock()} placeholder="Password" type="password" trailing={Icon.eye()}/>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: WZ.ink2, fontSize: 13, fontWeight: 500 }}>
            <span style={{ width: 18, height: 18, borderRadius: 5, background: WZ.blue, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><path d="M5 12l5 5 9-12"/></svg>
            </span>
            Remember me
          </label>
          <span style={{ color: WZ.blue, fontWeight: 600, fontSize: 13 }}>Forgot password?</span>
        </div>

        <WzPrimaryBtn>Sign in <Icon.arrow/></WzPrimaryBtn>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: WZ.ink3, fontSize: 11, fontWeight: 600, margin: '16px 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <div style={{ flex: 1, height: 1, background: WZ.line }}/> or <div style={{ flex: 1, height: 1, background: WZ.line }}/>
        </div>

        <button style={{
          width: '100%', height: 52, borderRadius: 14, border: `1.5px solid ${WZ.line}`,
          background: '#fff', color: WZ.ink, fontWeight: 600, fontSize: 15,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer',
        }}>
          <span style={{ width: 24, height: 24, borderRadius: 5, background: '#0A66C2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <LinkedInGlyph size={14} color="#fff"/>
          </span>
          Continue with LinkedIn
        </button>

        <div style={{ flex: 1 }}/>
        <div style={{ textAlign: 'center', marginTop: 18, color: WZ.ink2, fontSize: 13 }}>
          New here? <span style={{ color: WZ.blue, fontWeight: 700 }}>Create account</span>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
// 2. SIGNUP — role cards instead of dropdown
// ═════════════════════════════════════════════
function NewSignup() {
  const [role, setRole] = React.useState('jobseeker');
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#fff', overflow: 'auto' }}>
      <WzPhoneStatus/>
      {/* slim hero */}
      <div style={{
        position: 'relative', padding: '60px 24px 30px',
        background: WZ.gradHero,
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
      }}>
        <WzPatternBg opacity={0.4}/>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, marginBottom: 8 }}>
          <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.22)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icon.back()}
          </button>
          <WezumeWordmark size={24} light/>
        </div>
        <div className="font-display" style={{ color: '#fff', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', position: 'relative' }}>
          Make your wezume
        </div>
        <div style={{ color: 'rgba(255,255,255,0.82)', fontSize: 13, marginTop: 4, position: 'relative' }}>
          60-second video resume. No fluff.
        </div>
      </div>

      <div style={{ padding: '18px 24px 32px' }}>
        {/* 5 role tiles, grouped by intent */}
        <div style={{ fontSize: 11, color: WZ.ink3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          I'm here to · <span style={{ color: WZ.blue }}>build</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
          {ROLES.filter(r => r.group === 'build').map(r => (
            <RoleTile key={r.id} role={r} selected={role === r.id} onClick={() => setRole(r.id)}/>
          ))}
        </div>

        <div style={{ fontSize: 11, color: WZ.ink3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          ... or · <span style={{ color: WZ.blue }}>hire</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
          {ROLES.filter(r => r.group === 'hire').map(r => (
            <RoleTile key={r.id} role={r} selected={role === r.id} onClick={() => setRole(r.id)}/>
          ))}
        </div>

        <WzInput icon={Icon.user()} placeholder="Display name"/>
        <WzInput icon={Icon.mail()} placeholder="Email"/>
        <WzInput icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>} placeholder="Phone number"/>
        <WzInput icon={Icon.lock()} placeholder="Create password" type="password" trailing={Icon.eye()}/>

        {/* password strength */}
        <div style={{ display: 'flex', gap: 4, marginTop: -4, marginBottom: 16 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= 2 ? WZ.amber : WZ.line }}/>
          ))}
        </div>

        <WzPrimaryBtn>Create my wezume <Icon.arrow/></WzPrimaryBtn>

        <div style={{ fontSize: 11, color: WZ.ink3, textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
          By signing up you agree to our <span style={{ color: WZ.blue, fontWeight: 600 }}>Terms</span> & <span style={{ color: WZ.blue, fontWeight: 600 }}>Privacy</span>.
        </div>

        <div style={{ textAlign: 'center', marginTop: 18, color: WZ.ink2, fontSize: 13 }}>
          Already on wezume? <span style={{ color: WZ.blue, fontWeight: 700 }}>Sign in</span>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
// 2b. SIGNUP — STAGE (TikTok-feel, our Gen-Z pick)
// Kinetic candidate marquee + bold yellow CTA + 5 role tiles
// ═════════════════════════════════════════════
function NewSignupStage() {
  const [role, setRole] = React.useState('jobseeker');
  const [tagIdx, setTagIdx] = React.useState(0);
  const tags = ['🎤 show your voice', '⚡ skip the resume', '🚀 build in public'];
  React.useEffect(() => {
    const t = setInterval(() => setTagIdx(i => (i+1) % tags.length), 2200);
    return () => clearInterval(t);
  }, []);

  const rows = [[0,1,2,3,4,5,6,7], [8,9,10,11,12,13,14,15]];

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: WZ.midnight, overflow: 'auto',
      display: 'flex', flexDirection: 'column',
    }}>
      <WzPhoneStatus dark/>

      {/* hero: candidate marquee */}
      <div style={{ flex: '0 0 260px', position: 'relative', overflow: 'hidden', paddingTop: 60 }}>
        {rows.map((row, ri) => (
          <div key={ri} style={{
            display: 'flex', gap: 6, padding: '3px 0',
            animation: `${ri % 2 === 0 ? 'w-marquee-x' : 'w-marquee-x-rev'} ${22 + ri*4}s linear infinite`,
            width: 'max-content',
          }}>
            {[...row, ...row].map((idx, i) => (
              <div key={i} style={{
                width: 68, height: 90, borderRadius: 12, overflow: 'hidden', flex: '0 0 auto',
                boxShadow: '0 10px 20px rgba(0,0,0,0.4)',
              }}>
                <window.PortraitAvatar idx={idx} name={window.SAMPLE_NAMES[idx % window.SAMPLE_NAMES.length]}/>
              </div>
            ))}
          </div>
        ))}

        {/* gradient fade */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `linear-gradient(180deg, ${WZ.midnight}EE 0%, transparent 25%, transparent 55%, ${WZ.midnight} 100%)`,
        }}/>

        {/* topbar */}
        <div style={{
          position: 'absolute', top: 56, left: 18, right: 18, zIndex: 3,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <window.WezumeWordmark size={24} light/>
          <div style={{
            padding: '5px 11px', borderRadius: 999,
            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.18)', color: '#fff',
            fontWeight: 700, fontSize: 11,
          }}>
            {tags[tagIdx]}
          </div>
        </div>
      </div>

      {/* body */}
      <div style={{ flex: 1, padding: '0 22px 32px', marginTop: -16, position: 'relative' }}>
        <div className="font-display" style={{
          color: '#fff', fontSize: 32, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em',
        }}>
          Pick your<br/>
          <span style={{
            background: 'linear-gradient(90deg, #FFC93A, #FF9F43)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>lane.</span>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 6, marginBottom: 18 }}>
          You can change later. Promise.
        </div>

        {/* BUILDING side */}
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          I'm here to build
          <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }}/>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 12 }}>
          {ROLES.filter(r => r.group === 'build').map(r => (
            <StageRoleTile key={r.id} role={r} selected={role === r.id} onClick={() => setRole(r.id)}/>
          ))}
        </div>

        {/* HIRING side */}
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          ... or hire
          <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }}/>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 18 }}>
          {ROLES.filter(r => r.group === 'hire').map(r => (
            <StageRoleTile key={r.id} role={r} selected={role === r.id} onClick={() => setRole(r.id)}/>
          ))}
        </div>

        {/* basics */}
        <WzInput dark icon={Icon.user()} placeholder="Display name"/>
        <WzInput dark icon={Icon.mail()} placeholder="Email or phone"/>
        <WzInput dark icon={Icon.lock()} placeholder="Password" type="password" trailing={Icon.eye()}/>

        <button style={{
          width: '100%', height: 54, borderRadius: 14, border: 0, cursor: 'pointer',
          background: 'linear-gradient(90deg, #FFC93A, #FF9F43)', color: WZ.ink,
          fontWeight: 800, fontSize: 15, marginTop: 6, marginBottom: 12,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: '0 14px 34px rgba(255,201,58,0.4)',
        }}>
          Let's go <Icon.arrow/>
        </button>

        <button style={{
          width: '100%', height: 50, borderRadius: 14,
          background: 'rgba(255,255,255,0.06)', color: '#fff',
          border: '1px solid rgba(255,255,255,0.14)', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          fontWeight: 600, fontSize: 14,
        }}>
          <LinkedInGlyph size={18} color="#fff"/> Continue with LinkedIn
        </button>

        <div style={{ textAlign: 'center', marginTop: 18, color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
          Already on wezume? <span style={{ color: '#FFC93A', fontWeight: 700 }}>Sign in</span>
        </div>
      </div>
    </div>
  );
}

// Dark-mode role tile for Stage variant
function StageRoleTile({ role, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '10px 8px', borderRadius: 14, cursor: 'pointer',
      background: selected ? role.color : 'rgba(255,255,255,0.06)',
      color: '#fff',
      border: selected ? `1.5px solid ${role.color}` : '1.5px solid rgba(255,255,255,0.10)',
      boxShadow: selected ? `0 14px 30px ${role.color}66` : 'none',
      transition: 'all .15s', textAlign: 'left',
      position: 'relative', overflow: 'hidden',
      transform: selected ? 'translateY(-2px)' : 'none',
    }}>
      <div style={{ fontSize: 18, marginBottom: 4 }}>{role.emoji}</div>
      <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '-0.01em' }}>{role.label}</div>
      <div style={{ fontSize: 9, opacity: 0.78, marginTop: 1 }}>{role.sub}</div>
      {selected && (
        <div style={{
          position: 'absolute', top: 7, right: 7,
          width: 16, height: 16, borderRadius: '50%', background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={role.color} strokeWidth="4"><path d="M5 12l5 5 9-12"/></svg>
        </div>
      )}
    </button>
  );
}

// ═════════════════════════════════════════════
// 3. EDIT PROFILE
// ═════════════════════════════════════════════
function NewEditProfile() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: WZ.bg, overflow: 'auto' }}>
      <WzPhoneStatus/>
      {/* slim header */}
      <div style={{
        background: WZ.gradHero,
        padding: '54px 20px 70px', position: 'relative', overflow: 'hidden',
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
      }}>
        <WzPatternBg opacity={0.35}/>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
          <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.22)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icon.back()}
          </button>
          <div className="font-display" style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>Edit Profile</div>
          <div style={{ marginLeft: 'auto', opacity: 0.9 }}>
            <window.WezumeWordmark size={22} light/>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px 32px', marginTop: -50, position: 'relative' }}>
        {/* avatar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <div style={{ position: 'relative', width: 110, height: 110 }}>
            <div style={{ width: 110, height: 110, borderRadius: '50%', overflow: 'hidden', border: '5px solid #fff', boxShadow: '0 10px 30px rgba(11,22,35,0.15)' }}>
              <PortraitAvatar idx={3} name="K" round/>
            </div>
            <button style={{
              position: 'absolute', bottom: 0, right: 0, width: 34, height: 34, borderRadius: '50%',
              background: WZ.blue, border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </button>
          </div>
        </div>
        <div style={{ textAlign: 'center', fontSize: 13, color: WZ.blue, fontWeight: 600, marginBottom: 22 }}>Change photo</div>

        {/* form card */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 16, boxShadow: '0 4px 14px rgba(11,22,35,0.06)', border: `1px solid ${WZ.line}` }}>
          <div style={{ fontSize: 11, color: WZ.ink3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Basics
          </div>
          <WzInput icon={Icon.user()} placeholder="First name" value="Kumaran"/>
          <WzInput icon={Icon.user()} placeholder="Last name" value="C"/>
          <WzInput icon={Icon.mail()} placeholder="Email" value="kumaranc.82@gmail.com"/>
          <WzInput icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>} placeholder="Phone" value="7619591122"/>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, padding: 16, marginTop: 12, boxShadow: '0 4px 14px rgba(11,22,35,0.06)', border: `1px solid ${WZ.line}` }}>
          <div style={{ fontSize: 11, color: WZ.ink3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Work
          </div>
          <WzInput icon={Icon.briefcase()} placeholder="Industry" value="BFSI"/>
          <WzInput icon={Icon.globe()} placeholder="Location" value="Bengaluru"/>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button style={{ flex: 1, height: 52, borderRadius: 14, border: `1.5px solid ${WZ.line}`, background: '#fff', color: WZ.ink, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Cancel
          </button>
          <WzPrimaryBtn style={{ flex: 2 }}>Save changes</WzPrimaryBtn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  WZ, WzInput, WzPrimaryBtn, WzPhoneStatus, WzPatternBg,
  NewLogin, NewSignup, NewSignupStage, NewEditProfile, ROLES,
});
