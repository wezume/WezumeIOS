// Onboarding flow — first-time users only
// Landing → Role select → Details → Success → Home

const { WezumeMic, WezumeWordmark, WezumeLogoMark, WezumeSplashMark, Icon, LinkedInGlyph,
        PortraitAvatar, SAMPLE_NAMES, WZ, ROLES,
        WzPhoneStatus, WzPatternBg, WzInput, WzPrimaryBtn } = window;

// Step dots / progress indicator
function StepDots({ current = 1, total = 3, light = false }) {
  return (
    <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
      {Array.from({ length: total }).map((_, i) => {
        const isCurrent = i + 1 === current;
        const isDone = i + 1 < current;
        return (
          <div key={i} style={{
            width: isCurrent ? 24 : 6, height: 6, borderRadius: 999,
            background: isCurrent ? (light ? '#FFC93A' : WZ.blue) :
                       isDone    ? (light ? 'rgba(255,255,255,0.6)' : `${WZ.blue}66`) :
                                   (light ? 'rgba(255,255,255,0.2)' : WZ.line),
            transition: 'all .25s ease',
          }}/>
        );
      })}
    </div>
  );
}

// ═════════════════════════════════════════════
// STEP 0 — LANDING / WELCOME
// First screen on first open. Sells the product in 2 lines.
// ═════════════════════════════════════════════
function NewLanding({ onStart, onSignIn }) {
  const [tagIdx, setTagIdx] = React.useState(0);
  const taglines = [
    { line: ['Skip the', 'résumé.'], accent: 'résumé.' },
    { line: ['Hire by', 'vibe.'],   accent: 'vibe.' },
    { line: ['Show your', 'story.'], accent: 'story.' },
    { line: ['Land it in', '60 sec.'], accent: '60 sec.' },
  ];
  React.useEffect(() => {
    const t = setInterval(() => setTagIdx(i => (i+1) % taglines.length), 2400);
    return () => clearInterval(t);
  }, []);
  const cur = taglines[tagIdx];

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: WZ.gradHeroDeep, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <WzPhoneStatus dark/>
      {/* atmospheric glows */}
      <div style={{ position: 'absolute', top: -100, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(82,181,224,0.55), transparent 65%)', filter: 'blur(10px)' }}/>
      <div style={{ position: 'absolute', bottom: -80, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,201,58,0.25), transparent 65%)', filter: 'blur(20px)' }}/>
      <WzPatternBg opacity={0.18}/>

      {/* topbar with wordmark + sign-in */}
      <div style={{
        position: 'relative', zIndex: 2,
        padding: '58px 22px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <WezumeWordmark size={24} light/>
        <button onClick={onSignIn} style={{
          padding: '7px 12px', borderRadius: 999,
          background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.20)',
          color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer',
        }}>
          Sign in
        </button>
      </div>

      {/* hero */}
      <div style={{
        flex: 1, position: 'relative', zIndex: 2,
        padding: '20px 22px 16px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <div style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4, marginBottom: 14 }}>
            <div style={{ animation: 'w-bob 3.6s ease-in-out infinite' }}>
              <WezumeSplashMark size={150} ringColor="rgba(255,255,255,0.18)" innerBg="#fff" innerColor={WZ.blue}/>
            </div>
          </div>

          {/* brand strapline — sits between logo and rotating hook */}
          <div style={{
            textAlign: 'center', marginBottom: 18,
            color: '#FFC93A', fontWeight: 800, fontSize: 11,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            <span style={{ width: 18, height: 1, background: 'rgba(255,201,58,0.45)' }}/>
            Speak up. Stand out.
            <span style={{ width: 18, height: 1, background: 'rgba(255,201,58,0.45)' }}/>
          </div>

          {/* rotating tagline */}
          <div className="font-display" key={tagIdx} style={{
            color: '#fff', fontSize: 44, fontWeight: 800,
            letterSpacing: '-0.04em', lineHeight: 0.98, textAlign: 'center',
            animation: 'w-bob 0.5s ease-out',
          }}>
            {cur.line[0]}<br/>
            <span style={{
              background: 'linear-gradient(90deg, #FFC93A, #FF9F43)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>{cur.line[1]}</span>
          </div>

          <div style={{
            color: 'rgba(255,255,255,0.72)', fontSize: 14, textAlign: 'center',
            marginTop: 14, lineHeight: 1.5, maxWidth: 300, marginLeft: 'auto', marginRight: 'auto',
          }}>
            Record a 60-second video. Get matched. Land roles, gigs, capital — by who you are, not what you wrote.
          </div>
        </div>

        {/* social proof */}
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            margin: '20px 0',
          }}>
            <div style={{ display: 'flex' }}>
              {[5, 8, 11, 2].map((i, k) => (
                <div key={k} style={{
                  width: 26, height: 26, borderRadius: '50%', overflow: 'hidden',
                  border: '2px solid #0E5A8E', marginLeft: k === 0 ? 0 : -8,
                }}>
                  <PortraitAvatar idx={i} name={SAMPLE_NAMES[i]} round/>
                </div>
              ))}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.78)', fontSize: 12 }}>
              <b style={{ color: '#fff' }}>10,000+</b> ditched the résumé
            </div>
          </div>

          <button onClick={onStart} style={{
            width: '100%', height: 56, borderRadius: 16, border: 0, cursor: 'pointer',
            background: 'linear-gradient(90deg, #FFC93A, #FF9F43)', color: WZ.ink,
            fontWeight: 800, fontSize: 16,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: '0 18px 40px rgba(255,201,58,0.45)',
          }}>
            Level up <Icon.arrow/>
          </button>

          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
            marginTop: 14, color: 'rgba(255,255,255,0.55)', fontSize: 11,
          }}>
            ✨ 60 seconds. No résumé. No script.
          </div>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
// STEP 1 — ROLE SELECTION (TikTok-feel · auto-advance)
// Tap a tile → highlight → auto-advance (no continue button)
// ═════════════════════════════════════════════
function NewRoleSelectStep({ onNext, onBack, defaultRole = null }) {
  const [role, setRole] = React.useState(defaultRole);
  const [advancing, setAdvancing] = React.useState(false);

  const pick = (id) => {
    if (advancing) return;
    setRole(id);
    setAdvancing(true);
    setTimeout(() => { onNext?.(id); setAdvancing(false); }, 480);
  };

  // Two rows of candidate avatars for the marquee hero
  const rows = [
    [0,1,2,3,4,5,6,7],
    [8,9,10,11,12,13,14,15],
  ];

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      // Premium: dark "stage" top → lit blue bottom (vertical depth)
      background: 'linear-gradient(180deg, #03152A 0%, #06243F 28%, #093E66 58%, #0E5A8E 100%)',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <WzPhoneStatus dark/>

      {/* atmospheric glows — stage lighting */}
      <div style={{ position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)', width: 360, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(82,181,224,0.50), transparent 65%)', filter: 'blur(28px)' }}/>
      <div style={{ position: 'absolute', bottom: -120, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,201,58,0.22), transparent 65%)', filter: 'blur(24px)' }}/>
      <div style={{ position: 'absolute', bottom: 100, right: -80, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,107,0.18), transparent 65%)', filter: 'blur(24px)' }}/>

      {/* subtle film-grain noise for premium depth */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.08, mixBlendMode: 'overlay', pointerEvents: 'none',
        backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>\")",
      }}/>

      {/* topbar */}
      <div style={{ position: 'relative', zIndex: 3, padding: '58px 22px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          backdropFilter: 'blur(10px)',
        }}>
          {Icon.back()}
        </button>
        <WezumeWordmark size={22} light/>
        <div style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.78)', fontSize: 11, fontWeight: 600 }}>
          Step 1 of 3
        </div>
      </div>

      {/* progress dots */}
      <div style={{ position: 'relative', zIndex: 3, padding: '14px 22px 12px' }}>
        <StepDots current={1} total={3} light/>
      </div>

      {/* MARQUEE — kinetic candidate avatars, spotlit in the dark zone */}
      <div style={{
        position: 'relative', zIndex: 2,
        height: 168, overflow: 'hidden',
        maskImage: 'linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)',
      }}>
        {rows.map((row, ri) => (
          <div key={ri} style={{
            display: 'flex', gap: 8, padding: '3px 0',
            animation: `${ri % 2 === 0 ? 'w-marquee-x' : 'w-marquee-x-rev'} ${24 + ri * 4}s linear infinite`,
            width: 'max-content',
          }}>
            {[...row, ...row].map((idx, i) => (
              <div key={i} style={{
                width: 64, height: 80, borderRadius: 12, overflow: 'hidden', flex: '0 0 auto',
                boxShadow: '0 14px 28px rgba(0,0,0,0.45), 0 0 0 1.5px rgba(255,255,255,0.10) inset',
              }}>
                <PortraitAvatar idx={idx} name={SAMPLE_NAMES[idx % SAMPLE_NAMES.length]}/>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* title block — compact, sits at the transition between dark and light zones */}
      <div style={{ position: 'relative', zIndex: 3, padding: '14px 22px 12px', textAlign: 'center' }}>
        <div className="font-display" style={{
          color: '#fff', fontSize: 30, fontWeight: 800,
          letterSpacing: '-0.03em', lineHeight: 1.0,
          textShadow: '0 2px 20px rgba(0,0,0,0.4)',
        }}>
          Pick your <span style={{
            background: 'linear-gradient(90deg, #FFC93A, #FF9F43)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>lane.</span>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12.5, marginTop: 6 }}>
          One choice. Make it count.
        </div>
      </div>

      {/* tile groups — Hire on top (2), Build below (2 + 1 = cascade) */}
      <div style={{ flex: 1, padding: '0 16px 22px', position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* HIRE label */}
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.10em', padding: '0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: WZ.coral }}/>
          Hire
          <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }}/>
        </div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {ROLES.filter(r => r.group === 'hire').map(r => (
            <StageTile key={r.id} role={r} selected={role === r.id} advancing={advancing} onClick={() => pick(r.id)} tall/>
          ))}
        </div>

        {/* BUILD label */}
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.10em', padding: '0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: WZ.green }}/>
          Build
          <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }}/>
        </div>
        {/* Build row 1: 2 tiles */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {ROLES.filter(r => r.group === 'build').slice(0, 2).map(r => (
            <StageTile key={r.id} role={r} selected={role === r.id} advancing={advancing} onClick={() => pick(r.id)} tall/>
          ))}
        </div>
        {/* Build row 2: 1 tile (full-width, the lone centerpiece) */}
        <div style={{ flex: '0 0 auto' }}>
          {ROLES.filter(r => r.group === 'build').slice(2).map(r => (
            <StageTile key={r.id} role={r} selected={role === r.id} advancing={advancing} onClick={() => pick(r.id)} wide/>
          ))}
        </div>

        {/* hint */}
        <div style={{
          textAlign: 'center', padding: '4px 0 0',
          fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 500,
        }}>
          {advancing
            ? <><span style={{ color: '#FFC93A', fontWeight: 700 }}>Got it.</span> Taking you in…</>
            : <>Tap a card to continue</>
          }
        </div>
      </div>
    </div>
  );
}

// Dark stage role tile — used in TikTok-style onboarding
// tall = portrait card (Hire & Build row 1)
// wide = horizontal card with side-by-side icon + text (Build row 2, the cascade)
function StageTile({ role, selected, advancing, onClick, tall = false, wide = false }) {
  if (wide) {
    return (
      <button onClick={onClick} style={{
        width: '100%', padding: '12px 14px',
        borderRadius: 18, cursor: 'pointer',
        background: selected ? role.color : 'rgba(255,255,255,0.07)',
        color: '#fff',
        border: selected ? `1.5px solid ${role.color}` : '1.5px solid rgba(255,255,255,0.10)',
        boxShadow: selected ? `0 18px 40px ${role.color}80` : '0 10px 20px rgba(0,0,0,0.2)',
        transition: 'all .25s cubic-bezier(.34,1.56,.64,1)',
        transform: selected ? 'translateY(-3px) scale(1.02)' : 'none',
        position: 'relative', overflow: 'hidden',
        textAlign: 'left', fontFamily: 'Inter, sans-serif',
        opacity: advancing && !selected ? 0.35 : 1,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 46, height: 46, borderRadius: 14, flexShrink: 0,
          background: selected ? 'rgba(255,255,255,0.22)' : `${role.color}24`,
          color: selected ? '#fff' : role.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26,
        }}>{role.emoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em' }}>{role.label}</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 1 }}>{role.sub}</div>
        </div>
        <div style={{
          width: 22, height: 22, borderRadius: '50%',
          background: selected ? '#fff' : 'transparent',
          border: selected ? '0' : '1.5px solid rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all .15s',
        }}>
          {selected && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={role.color} strokeWidth="4"><path d="M5 12l5 5 9-12"/></svg>}
        </div>
      </button>
    );
  }

  return (
    <button onClick={onClick} style={{
      padding: tall ? '14px 12px' : '12px 10px',
      borderRadius: 18, cursor: 'pointer',
      background: selected ? role.color : 'rgba(255,255,255,0.07)',
      color: '#fff',
      border: selected ? `1.5px solid ${role.color}` : '1.5px solid rgba(255,255,255,0.10)',
      boxShadow: selected ? `0 18px 40px ${role.color}80` : '0 8px 18px rgba(0,0,0,0.2)',
      transition: 'all .25s cubic-bezier(.34,1.56,.64,1)',
      transform: selected ? 'translateY(-4px) scale(1.04)' : 'none',
      position: 'relative', overflow: 'hidden',
      textAlign: 'left', fontFamily: 'Inter, sans-serif',
      opacity: advancing && !selected ? 0.35 : 1,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      minHeight: tall ? 110 : 'auto',
    }}>
      <div style={{
        width: tall ? 42 : 32, height: tall ? 42 : 32, borderRadius: 12,
        background: selected ? 'rgba(255,255,255,0.22)' : `${role.color}24`,
        color: selected ? '#fff' : role.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: tall ? 24 : 20,
        transition: 'all .2s',
      }}>{role.emoji}</div>
      <div>
        <div style={{ fontSize: tall ? 15 : 13, fontWeight: 800, letterSpacing: '-0.01em' }}>{role.label}</div>
        <div style={{ fontSize: tall ? 11 : 10, opacity: 0.82, marginTop: 2, lineHeight: 1.3 }}>{role.sub}</div>
      </div>
      {selected && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          width: 22, height: 22, borderRadius: '50%', background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'w-bob 0.3s ease-out',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={role.color} strokeWidth="4"><path d="M5 12l5 5 9-12"/></svg>
        </div>
      )}
    </button>
  );
}

// ═════════════════════════════════════════════
// STEP 2 — DETAILS
// ═════════════════════════════════════════════
function NewDetailsStep({ role = 'jobseeker', onNext, onBack }) {
  const selectedRole = ROLES.find(r => r.id === role);
  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: '#fff', overflow: 'auto', display: 'flex', flexDirection: 'column',
    }}>
      <WzPhoneStatus/>
      {/* slim hero */}
      <div style={{
        position: 'relative', background: WZ.gradHero,
        padding: '54px 22px 26px',
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
      }}>
        <WzPatternBg opacity={0.28}/>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.22)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {Icon.back()}
          </button>
          <WezumeWordmark size={22} light/>
          <div style={{ marginLeft: 'auto', color: '#fff', fontSize: 11, fontWeight: 600, opacity: 0.85 }}>
            Step 2 of 3
          </div>
        </div>

        <div style={{ marginTop: 16, position: 'relative' }}>
          <StepDots current={2} total={3} light/>
        </div>

        <div className="font-display" style={{
          color: '#fff', fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em',
          marginTop: 18, lineHeight: 1.1, position: 'relative',
        }}>
          A few quick details.
        </div>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4, position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '2px 8px', borderRadius: 999,
            background: 'rgba(255,255,255,0.18)', color: '#fff', fontSize: 11, fontWeight: 700,
            backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.22)',
          }}>
            <span>{selectedRole?.emoji}</span> {selectedRole?.label}
          </span>
          <span style={{ opacity: 0.6 }}>· change</span>
        </div>
      </div>

      {/* form */}
      <div style={{ flex: 1, padding: '22px 22px 16px' }}>
        <WzInput icon={Icon.user()} placeholder="Display name"/>
        <WzInput icon={Icon.mail()} placeholder="Email"/>
        <WzInput icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>} placeholder="Phone"/>
        <WzInput icon={Icon.lock()} placeholder="Create password" type="password" trailing={Icon.eye()}/>

        {/* password strength */}
        <div style={{ display: 'flex', gap: 4, marginTop: -4, marginBottom: 6 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= 3 ? WZ.green : WZ.line }}/>
          ))}
        </div>
        <div style={{ fontSize: 11, color: WZ.green, fontWeight: 700, marginBottom: 12 }}>
          Strong password 💪
        </div>

        <div style={{ fontSize: 11, color: WZ.ink3, lineHeight: 1.5, marginBottom: 16 }}>
          You agree to our{' '}
          <span style={{ color: WZ.blue, fontWeight: 600 }}>Terms</span> &{' '}
          <span style={{ color: WZ.blue, fontWeight: 600 }}>Privacy</span>.
        </div>
      </div>

      {/* sticky CTA */}
      <div style={{ padding: '12px 22px 28px', borderTop: `1px solid ${WZ.line}` }}>
        <button onClick={onNext} style={{
          width: '100%', height: 54, borderRadius: 14, border: 0, cursor: 'pointer',
          background: WZ.gradPrimary, color: '#fff', fontWeight: 800, fontSize: 15,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: `0 14px 30px ${WZ.blue}55`,
        }}>
          Create my wezume <Icon.arrow/>
        </button>
        <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: WZ.ink3 }}>
          Or <button style={{ background: 'transparent', border: 0, color: WZ.blue, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>continue with LinkedIn</button>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════
// STEP 3 — SUCCESS / WELCOME ABOARD
// ═════════════════════════════════════════════
function NewSignupSuccess({ role = 'jobseeker', onRecord, onSkip }) {
  const selectedRole = ROLES.find(r => r.id === role);
  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      background: WZ.gradHeroDeep, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <WzPhoneStatus dark/>
      {/* atmospheric glows */}
      <div style={{ position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,201,58,0.45), transparent 65%)', filter: 'blur(20px)' }}/>
      <div style={{ position: 'absolute', bottom: -120, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(82,181,224,0.4), transparent 65%)', filter: 'blur(20px)' }}/>
      <WzPatternBg opacity={0.15}/>

      {/* topbar */}
      <div style={{ position: 'relative', zIndex: 2, padding: '58px 22px 0', display: 'flex', justifyContent: 'center' }}>
        <StepDots current={3} total={3} light/>
      </div>

      {/* center */}
      <div style={{
        flex: 1, position: 'relative', zIndex: 2,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '0 24px', textAlign: 'center',
      }}>
        {/* celebration mark */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <WezumeSplashMark size={150} ringColor="rgba(255,255,255,0.18)" innerBg="#fff" innerColor={WZ.blue}/>
          {/* checkmark badge */}
          <div style={{
            position: 'absolute', bottom: -2, right: -4,
            width: 44, height: 44, borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFC93A, #FF9F43)',
            border: '4px solid #0E5A8E',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 24px rgba(255,201,58,0.5)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B1623" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-12"/></svg>
          </div>
        </div>

        {/* confetti dots */}
        {[
          { l: '15%', t: '20%', c: '#FFC93A', s: 8 },
          { l: '80%', t: '24%', c: '#52B5E0', s: 6 },
          { l: '10%', t: '54%', c: '#FF6B6B', s: 10 },
          { l: '88%', t: '60%', c: '#2CC6A1', s: 7 },
          { l: '24%', t: '76%', c: '#FFC93A', s: 5 },
          { l: '72%', t: '78%', c: '#6B6BFF', s: 8 },
        ].map((d, i) => (
          <div key={i} style={{
            position: 'absolute', left: d.l, top: d.t,
            width: d.s, height: d.s, borderRadius: '50%', background: d.c,
            animation: `w-bob ${2.4 + i * 0.3}s ease-in-out infinite`,
            opacity: 0.85,
          }}/>
        ))}

        <div className="font-display" style={{
          color: '#fff', fontSize: 34, fontWeight: 800,
          letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 8,
        }}>
          You're <span style={{
            background: 'linear-gradient(90deg, #FFC93A, #FF9F43)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>in.</span>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14, lineHeight: 1.5, maxWidth: 290 }}>
          Welcome, <b style={{ color: '#fff' }}>{selectedRole?.emoji} {selectedRole?.label}</b>.<br/>
          Now let's record your first take — 60 seconds, no script needed.
        </div>

        {/* mini onboarding checklist */}
        <div style={{
          marginTop: 28, padding: 14, borderRadius: 16,
          background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.14)',
          width: '100%', maxWidth: 320,
        }}>
          {[
            { done: true,  label: 'Account created' },
            { done: false, label: 'Record your first take', highlight: true },
            { done: false, label: 'Get your AI Review' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: item.done ? WZ.green : (item.highlight ? '#FFC93A' : 'rgba(255,255,255,0.1)'),
                color: item.done || item.highlight ? '#0B1623' : 'rgba(255,255,255,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 11,
              }}>
                {item.done ? '✓' : (i + 1)}
              </div>
              <div style={{
                color: item.done ? 'rgba(255,255,255,0.55)' : '#fff',
                fontSize: 13, fontWeight: item.highlight ? 700 : 500,
                textDecoration: item.done ? 'line-through' : 'none',
              }}>{item.label}</div>
              {item.highlight && (
                <span style={{ marginLeft: 'auto', fontSize: 10, color: '#FFC93A', fontWeight: 700 }}>NEXT</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* bottom CTAs */}
      <div style={{ position: 'relative', zIndex: 2, padding: '0 22px 32px' }}>
        <button onClick={onRecord} style={{
          width: '100%', height: 56, borderRadius: 16, border: 0, cursor: 'pointer',
          background: 'linear-gradient(90deg, #FFC93A, #FF9F43)', color: WZ.ink,
          fontWeight: 800, fontSize: 16, marginBottom: 10,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: '0 18px 40px rgba(255,201,58,0.45)',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6"/></svg>
          Record my first take
        </button>
        <button onClick={onSkip} style={{
          width: '100%', height: 48, borderRadius: 14, border: 0, cursor: 'pointer',
          background: 'transparent', color: 'rgba(255,255,255,0.78)',
          fontWeight: 600, fontSize: 13,
        }}>
          Skip for now — explore the app
        </button>
      </div>
    </div>
  );
}

Object.assign(window, {
  NewLanding, NewRoleSelectStep, NewDetailsStep, NewSignupSuccess, StepDots, StageTile,
});
