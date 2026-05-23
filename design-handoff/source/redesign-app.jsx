// In-app jobseeker screens: Home (My Videos), Video Detail, AI Review, Side Menu, Profile, Search Grid, Chat

const { WezumeMic, WezumeWordmark, Icon, PortraitAvatar, SAMPLE_NAMES, WZ,
        WzPhoneStatus, WzPatternBg, WzPrimaryBtn, WzInput } = window;

// Topbar that matches the live app (logo, bell, menu)
function WzTopbar({ onMenu, dark = false }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
      height: 100, padding: '50px 18px 0',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: dark ? 'transparent' : `linear-gradient(180deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0) 100%)`,
    }}>
      <WezumeWordmark size={24} light/>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {Icon.bell()}
          <span style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: '50%', background: WZ.yellow, border: '2px solid rgba(30,155,215,0.9)' }}/>
        </button>
        <button onClick={onMenu} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
        </button>
      </div>
    </div>
  );
}

// Floating record FAB
function WzRecordFab() {
  return (
    <button style={{
      position: 'absolute', bottom: 90, right: 18, zIndex: 40,
      width: 60, height: 60, borderRadius: '50%',
      background: `linear-gradient(135deg, ${WZ.coral}, #FF8E58)`,
      border: '4px solid #fff', color: '#fff', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 16px 30px ${WZ.coral}55`,
    }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6"/></svg>
    </button>
  );
}

// Bottom nav matching the redesigned app
function WzBottomNav({ active = 'home' }) {
  const items = [
    { id: 'home', label: 'Home', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/></svg> },
    { id: 'feed', label: 'Discover', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg> },
    { id: 'inbox', label: 'Inbox', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a4 4 0 0 1-4 4H7l-4 3V5a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg> },
    { id: 'profile', label: 'Me', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg> },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: '10px 18px 28px', background: '#fff',
      borderTop: `1px solid ${WZ.line}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      zIndex: 5, boxShadow: '0 -8px 24px rgba(11,22,35,0.04)',
    }}>
      {items.map(it => (
        <button key={it.id} style={{
          background: 'transparent', border: 0, cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          color: active === it.id ? WZ.blue : WZ.ink3, fontWeight: 600, fontSize: 10,
        }}>
          {it.icon} {it.label}
        </button>
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════
// 4. HOME — replaces the "blue background + one video" layout
// ═════════════════════════════════════════════
// 4. HOME — post-recording home
// AI Review headline tag + AI Coach card + Your videos (with timestamps)
// ═════════════════════════════════════════════
function NewHome() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: WZ.bg, overflow: 'hidden' }}>
      <WzPhoneStatus/>
      {/* hero band */}
      <div style={{
        position: 'relative', height: 200,
        background: WZ.gradHero,
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
      }}>
        <WzPatternBg opacity={0.35}/>
        <WzTopbar/>
        <div style={{ position: 'relative', padding: '102px 20px 0' }}>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>good morning</div>
          <div className="font-display" style={{ color: '#fff', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 2 }}>
            Kumaran 👋
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px 100px', marginTop: -52, position: 'relative', height: 'calc(100% - 134px)', overflow: 'auto' }}>
        {/* AI Review headline card — replaces the score card */}
        <div style={{
          background: '#fff', borderRadius: 22, padding: 16,
          boxShadow: '0 14px 34px rgba(11,22,35,0.10)', border: `1px solid ${WZ.line}`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 110, height: 110, borderRadius: '50%', background: `radial-gradient(circle, ${WZ.yellow}26, transparent 70%)` }}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 8,
              background: `linear-gradient(135deg, ${WZ.blue}, ${WZ.blueDeep})`,
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{Icon.sparkles({ width: 14, height: 14 })}</div>
            <div style={{ fontSize: 10, color: WZ.ink3, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Latest AI Review · 2h ago
            </div>
          </div>
          <div className="font-display" style={{
            fontSize: 19, fontWeight: 800, color: WZ.ink, letterSpacing: '-0.02em', lineHeight: 1.2,
            marginBottom: 8, position: 'relative',
          }}>
            Structured & assured speaker, growing EQ.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
            <span style={{
              padding: '3px 8px', borderRadius: 999,
              background: `${WZ.green}1A`, color: WZ.green,
              fontSize: 11, fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M5 12l5 5 9-12"/></svg>
              Clearer than 50%
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: WZ.blue, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              See full review {Icon.arrow({ width: 12, height: 12 })}
            </span>
          </div>
        </div>

        {/* AI Coach card */}
        <div style={{
          marginTop: 12, padding: 14, borderRadius: 18, color: '#fff',
          background: `linear-gradient(135deg, ${WZ.navy} 0%, ${WZ.navySoft} 100%)`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, borderRadius: '50%', background: `radial-gradient(circle, ${WZ.yellow}50, transparent 70%)` }}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: `linear-gradient(135deg, ${WZ.yellow}, #FF9F43)`, color: WZ.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {Icon.sparkles({ width: 14, height: 14 })}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI Coach</div>
          </div>
          <div className="font-display" style={{ fontSize: 14, fontWeight: 700, marginTop: 8, lineHeight: 1.3 }}>
            Eye contact is your biggest gap. Try a re-take today.
          </div>
          <button style={{ marginTop: 10, background: WZ.yellow, color: WZ.ink, border: 0, borderRadius: 10, padding: '7px 12px', fontWeight: 800, fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Start take {Icon.arrow({ width: 13, height: 13 })}
          </button>
        </div>

        {/* my videos */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 20, marginBottom: 10 }}>
          <div>
            <div className="font-display" style={{ fontSize: 17, fontWeight: 700, color: WZ.ink }}>Your videos</div>
            <div style={{ fontSize: 11, color: WZ.ink3 }}>6 takes • 4 public</div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: WZ.blue, cursor: 'pointer' }}>See all</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { idx: 3, title: 'Intro · Marketing', when: '2h ago',   views: 421, featured: true },
            { idx: 1, title: 'Why Brand?',        when: '1d ago',   views: 612, isNew: true },
            { idx: 5, title: 'Side Project',      when: '5d ago',   views: 298 },
            { idx: 9, title: 'Goals 2026',        when: '2w ago',   views: 187 },
          ].map((v,i) => (
            <div key={i} style={{
              aspectRatio: '9/13', borderRadius: 16, overflow: 'hidden', position: 'relative',
              boxShadow: v.featured ? `0 10px 24px ${WZ.blue}40` : '0 4px 14px rgba(11,22,35,0.08)',
              border: v.featured ? `2px solid ${WZ.yellow}` : '0',
            }}>
              <PortraitAvatar idx={v.idx} name={SAMPLE_NAMES[v.idx]}/>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7))' }}/>
              {/* timestamp top-left */}
              <div style={{
                position: 'absolute', top: 8, left: 8,
                background: 'rgba(11,22,35,0.7)', backdropFilter: 'blur(10px)',
                borderRadius: 8, padding: '3px 7px', color: '#fff', fontSize: 10, fontWeight: 700,
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                {v.when}
              </div>
              {v.isNew && <div style={{ position: 'absolute', top: 8, right: 8, background: WZ.yellow, color: WZ.ink, borderRadius: 6, padding: '2px 6px', fontSize: 9, fontWeight: 800 }}>NEW</div>}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: WZ.ink }}>
                {Icon.play()}
              </div>
              <div style={{ position: 'absolute', bottom: 8, left: 8, right: 8, color: '#fff' }}>
                <div style={{ fontSize: 11, fontWeight: 700 }}>{v.title}</div>
                <div style={{ fontSize: 9, opacity: 0.9, marginTop: 2 }}>{v.views} views</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <WzRecordFab/>
      <WzBottomNav active="home"/>
    </div>
  );
}

// ═════════════════════════════════════════════
// 5. VIDEO DETAIL — replaces the wasteful blue padding around video
// Full-bleed video + clean action rail
// ═════════════════════════════════════════════
function NewVideoDetail() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#000', overflow: 'hidden' }}>
      <WzPhoneStatus dark/>
      <div style={{ position: 'absolute', inset: 0 }}>
        <PortraitAvatar idx={3} name="K"/>
        {/* dim */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.85) 100%)' }}/>
      </div>

      {/* top chrome */}
      <div style={{ position: 'absolute', top: 50, left: 0, right: 0, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', zIndex: 4 }}>
        <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(10px)', color: '#fff', border: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Icon.back()}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.22)' }}>
          <WezumeMic size={14} color="#fff" bg="transparent"/>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>wezume</span>
        </div>
      </div>

      {/* center play */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 3,
        width: 76, height: 76, borderRadius: '50%',
        background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(20px)',
        border: '2px solid rgba(255,255,255,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
        boxShadow: '0 14px 40px rgba(0,0,0,0.5)',
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      </div>

      {/* right rail — TikTok style */}
      <div style={{ position: 'absolute', right: 14, bottom: 200, display: 'flex', flexDirection: 'column', gap: 18, zIndex: 4 }}>
        {[
          { icon: Icon.heart(), count: '5', tint: WZ.coral },
          { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="12" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><line x1="8.6" y1="10.6" x2="15.4" y2="7.4"/><line x1="8.6" y1="13.4" x2="15.4" y2="16.6"/></svg>, count: 'Share' },
          { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>, count: 'Delete', tint: 'rgba(255,255,255,0.85)' },
        ].map((b, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <button style={{
              width: 46, height: 46, borderRadius: '50%',
              background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.18)',
              color: b.tint || '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>{b.icon}</button>
            <span style={{ color: '#fff', fontSize: 10, fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>{b.count}</span>
          </div>
        ))}
      </div>

      {/* bottom: caption + name + AI Review CTA */}
      <div style={{ position: 'absolute', bottom: 130, left: 16, right: 80, color: '#fff', zIndex: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: '2px solid #fff' }}>
            <PortraitAvatar idx={3} name="K" round/>
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>Naresh Kanth</span>
          <span style={{ fontSize: 11, opacity: 0.8 }}>· 2d ago</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.4, textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}>
          Hello, my name is Naresh Kant, I am from Ooty. Looking for marketing roles in B2B SaaS.
        </div>
      </div>

      {/* primary AI Review CTA bar */}
      <div style={{ position: 'absolute', bottom: 38, left: 16, right: 16, display: 'flex', gap: 10, zIndex: 4 }}>
        <button style={{
          flex: 1, height: 48, borderRadius: 14, border: 0, cursor: 'pointer',
          background: `linear-gradient(90deg, ${WZ.yellow}, #FF9F43)`,
          color: WZ.ink, fontWeight: 800, fontSize: 14,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: `0 14px 30px ${WZ.yellow}55`,
        }}>
          {Icon.sparkles({ width: 16, height: 16 })} AI Review
        </button>
        <button style={{
          width: 48, height: 48, borderRadius: 14, border: '1px solid rgba(255,255,255,0.25)',
          background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(12px)',
          color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="12" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><line x1="8.6" y1="10.6" x2="15.4" y2="7.4"/><line x1="8.6" y1="13.4" x2="15.4" y2="16.6"/></svg>
        </button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
// 6. AI REVIEW — refined dark mode
// ═════════════════════════════════════════════
function NewAIReview() {
  const metrics = [
    { label: 'Eye contact', icon: Icon.eye(), tier: 'Low', tip: 'Reduces confidence', val: 30, color: WZ.coral },
    { label: 'Smile', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>, tier: 'Low', tip: 'Limited smile detected', val: 28, color: WZ.coral },
    { label: 'Energy', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h7v8l10-12h-7z"/></svg>, tier: 'Low', tip: 'Low energy delivery', val: 34, color: WZ.coral },
    { label: 'Pitch (voice)', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="20" x2="6" y2="14"/><line x1="12" y1="20" x2="12" y2="8"/><line x1="18" y1="20" x2="18" y2="4"/></svg>, tier: 'Low', tip: 'Not engaging', val: 32, color: WZ.coral },
  ];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: WZ.navy, overflow: 'auto', color: '#fff' }}>
      <WzPhoneStatus dark/>
      <div style={{ padding: '54px 18px 32px' }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, marginBottom: 16 }}>
          <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icon.back()}
          </button>
          <div className="font-display" style={{ fontSize: 20, fontWeight: 700 }}>AI Review</div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <WezumeWordmark size={15} light/>
            <div style={{ padding: '4px 10px', borderRadius: 999, background: `${WZ.yellow}26`, color: WZ.yellow, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
              {Icon.sparkles({ width: 12, height: 12 })} Take 1
            </div>
          </div>
        </div>

        {/* hero summary card with circular score */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 22, padding: 18,
          display: 'flex', alignItems: 'center', gap: 16,
          backdropFilter: 'blur(20px)',
        }}>
          {/* circular score */}
          <div style={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
            <svg width="90" height="90" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="8"/>
              <circle cx="50" cy="50" r="42" fill="none" stroke={WZ.amber} strokeWidth="8" strokeDasharray="264" strokeDashoffset={264 - 264 * 0.5} strokeLinecap="round"/>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div className="font-display" style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>5.7</div>
              <div style={{ fontSize: 9, opacity: 0.6 }}>/ 10</div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="font-display" style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.25 }}>
              Structured & assured speaker, growing EQ
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={WZ.green} strokeWidth="3"><path d="M5 12l5 5 9-12"/></svg>
              Clearer than 50% of candidates
            </div>
          </div>
        </div>

        {/* biggest gap callout */}
        <div style={{
          marginTop: 12, padding: 12, borderRadius: 14,
          background: `${WZ.amber}1F`, border: `1px solid ${WZ.amber}55`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ width: 30, height: 30, borderRadius: 10, background: `${WZ.amber}33`, color: WZ.amber, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: WZ.amber, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Biggest gap</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 1 }}>Eye contact is your main growth area.</div>
          </div>
        </div>

        {/* metric tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
          {metrics.map(m => (
            <div key={m.label} style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 16, padding: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff' }}>
                {m.icon}
                <span style={{ fontWeight: 700, fontSize: 13 }}>{m.label}</span>
              </div>
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ padding: '2px 8px', borderRadius: 999, background: `${m.color}26`, color: m.color, fontSize: 10, fontWeight: 800 }}>{m.tier}</span>
                <span style={{ fontSize: 11, color: m.color, fontWeight: 700 }}>{m.val}%</span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 999, marginTop: 6, overflow: 'hidden' }}>
                <div style={{ width: `${m.val}%`, height: '100%', background: m.color, borderRadius: 999 }}/>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 6 }}>{m.tip}</div>
            </div>
          ))}
        </div>

        {/* summary panel */}
        <div style={{
          marginTop: 14, padding: 14, borderRadius: 18,
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 18 }}>🪞</span>
            <span style={{ fontWeight: 700, fontSize: 13 }}>How you came across</span>
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.5, color: 'rgba(255,255,255,0.78)' }}>
            Your <b style={{ color: '#fff' }}>clarity</b> was the most impressive. <b style={{ color: WZ.amber }}>Eye contact</b> is your biggest opportunity in your next attempt.
          </div>
        </div>

        {/* strongest / improve */}
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <div style={{ flex: 1, padding: 12, borderRadius: 14, background: `${WZ.green}1A`, border: `1px solid ${WZ.green}55` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 12, color: WZ.green }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: WZ.green }}/>
              Strongest · Clarity
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.78)', marginTop: 4 }}>Well-structured & easy to follow.</div>
          </div>
          <div style={{ flex: 1, padding: 12, borderRadius: 14, background: `${WZ.coral}1A`, border: `1px solid ${WZ.coral}55` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 12, color: WZ.coral }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: WZ.coral }}/>
              Improve · Eye contact
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.78)', marginTop: 4 }}>Builds trust & confidence.</div>
          </div>
        </div>

        {/* improvements checklist */}
        <div style={{ marginTop: 14, padding: 14, borderRadius: 18, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 18 }}>🎯</span>
            <span style={{ fontWeight: 700, fontSize: 13 }}>Improve your next attempt</span>
          </div>
          {[
            'Focus on the camera lens to establish connection.',
            'Start & end key points with a natural, friendly smile.',
            'Vary your volume slightly to convey passion.',
          ].map((tip, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : '0' }}>
              <div style={{ width: 18, height: 18, borderRadius: 5, border: '1.5px solid rgba(255,255,255,0.3)', flexShrink: 0, marginTop: 1 }}/>
              <div style={{ fontSize: 12, lineHeight: 1.4, color: 'rgba(255,255,255,0.85)' }}>{tip}</div>
            </div>
          ))}
        </div>

        <button style={{
          marginTop: 16, width: '100%', height: 50, borderRadius: 14, border: 0, cursor: 'pointer',
          background: `linear-gradient(90deg, ${WZ.yellow}, #FF9F43)`, color: WZ.ink,
          fontWeight: 800, fontSize: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          Record next take {Icon.arrow({ width: 14, height: 14 })}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, {
  WzTopbar, WzRecordFab, WzBottomNav,
  NewHome, NewVideoDetail, NewAIReview,
});
