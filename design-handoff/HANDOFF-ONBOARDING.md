# Wezume — Onboarding Handoff (for Claude Code)

> **Scope:** First-time user onboarding flow + deferred email verification.
> Hand this file to Claude Code along with the assets listed at the bottom.

---

## Decision: deferred verification

We are **not** blocking signup on email/phone verification. The user:

1. Signs up (Landing → Role pick → Details → Success)
2. Records their first video and explores the app **immediately**
3. Sees a persistent "Verify to unlock matches" banner until verified
4. Verification (email link OR magic link OR future phone OTP) unlocks:
   - `verified ✓` badge on profile
   - Ability to be discovered by recruiters / investors
   - Match notifications

This trades immediate enforcement for higher signup completion and a stronger
dopamine moment on the first take.

---

## Routes

```
/onboarding/welcome     # Landing  (00a)
/onboarding/role        # Role pick (00b)
/onboarding/details     # Details   (00c)
/onboarding/done        # Success   (00d)

/home                   # Authenticated home (with unverified banner)
/profile/edit
/verify                 # Triggered from email link OR banner CTA
```

**Routing rules on app open:**

| State | Destination |
|---|---|
| `auth_token` missing AND `onboarded` flag missing | `/onboarding/welcome` |
| `auth_token` present, onboarding incomplete | resume at `/onboarding/{step}` |
| `auth_token` present, `onboarded=true` | `/home` |

---

## State shape

Hold the in-progress signup in a context provider; persist to `sessionStorage`
so refresh doesn't lose data.

```ts
type OnboardingState = {
  step: 'welcome' | 'role' | 'details' | 'done';
  role: 'jobseeker' | 'freelancer' | 'entrepreneur' | 'recruiter' | 'investor' | null;
  name: string;
  email: string;
  phone: string;        // optional, no '(optional)' label
  password: string;
};
```

After successful signup, persist to `localStorage`:

```ts
localStorage.setItem('auth_token', token);
localStorage.setItem('onboarded', 'true');
localStorage.setItem('verification_status', 'pending');
```

---

## API contract

| Endpoint | Method | Payload | Returns |
|---|---|---|---|
| `/api/signup` | POST | `{ role, name, email, phone, password }` | `{ token, user, verification_status: 'pending' }` |
| `/api/verify/send` | POST | `{ email }` | `{ sent_at }` — fires the verification email |
| `/api/verify/confirm?token=...` | GET | (token in query) | `{ verified: true }` and redirects to `/home` |
| `/api/me` | GET | (auth header) | `{ user, verification_status, role, ... }` |

Server marks the account `verification_status: 'pending'` on signup and
`'verified'` after the link is clicked. Discovery surfaces and match notifications
are gated on `verification_status === 'verified'`.

---

## Screens

### 00a · Landing (`/onboarding/welcome`)

- Hero splash mark (uses `assets/wezume-mark.jpg` — actual brand image)
- Brand strapline: **SPEAK UP. STAND OUT.** (uppercase, letter-spaced)
- Rotating tagline rotates every 2.4s through: "Skip the résumé.", "Hire by vibe.", "Show your story.", "Land it in 60 sec."
- Avatar stack (4 small) + "10,000+ ditched the résumé"
- Primary CTA: **Level up →** (yellow gradient button)
- Footer: "✨ 60 seconds. No résumé. No script."
- Top-right: "Sign in" link for returning users

### 00b · Role pick (`/onboarding/role`)

- Background: `linear-gradient(180deg, #03152A 0%, #06243F 28%, #093E66 58%, #0E5A8E 100%)`
- Top half is darker — spotlight effect for the candidate marquee (2 rows scrolling in opposite directions)
- Title: **Pick your lane.** ("lane." in yellow gradient)
- Subtitle: "One choice. Make it count."
- 5 role tiles, grouped:
  - **HIRE** (top row, 2 tiles): Recruiter, Investor
  - **BUILD** (below, 2-1 cascade): Jobseeker + Freelancer, then Entrepreneur full-width
- **Tap a tile → auto-advance after 480ms** (no Continue button)
- Selection animation: tile lifts + glows + ✓ badge

### 00c · Details (`/onboarding/details`)

- Blue hero gradient (`WZ.gradHero`), back arrow, step dots
- Selected role chip ("🎤 Jobseeker · change")
- Fields:
  - Display name
  - Email
  - Phone *(no "optional" label — but field is optional in validation)*
  - Password with 4-segment live strength meter
- Inline T&C: "You agree to our Terms & Privacy."
- Primary CTA: **Create my wezume →**
- Secondary: "Or continue with LinkedIn"
- **On submit:** POST `/api/signup`, then POST `/api/verify/send` in parallel, then push `/onboarding/done`

### 00d · Success (`/onboarding/done`)

- Same gradient bg, atmospheric glows, confetti dots
- Splash mark + yellow ✓ badge overlaid
- Headline: "You're **in**." (yellow accent)
- Personalised line: "Welcome, 🎤 Jobseeker."
- Checklist card (glass):
  - ✓ Account created
  - 2 · **Record your first take** (highlighted NEXT)
  - 3 · Get your AI Review
- Primary CTA: **Record my first take** (yellow gradient, 56px)
- Secondary: "Skip for now — explore the app"

---

## Deferred verification — implementation details

### 1. Send the verification email on signup
After `POST /api/signup` returns, fire `POST /api/verify/send` (don't await). The
email body links to `https://wezume.app/verify?token=XYZ`.

### 2. Show a persistent banner on `/home`
While `verification_status === 'pending'`, render the banner below the topbar.
**Dismissible per session** (`sessionStorage.dismissed_verify_banner = true`), but
**reappears next session** until verified.

```jsx
<VerifyBanner
  email={user.email}
  onResend={() => fetch('/api/verify/send', { method: 'POST', body: { email } })}
  onChangeEmail={() => router.push('/profile/edit')}
  onDismiss={() => sessionStorage.setItem('dismissed_verify_banner', 'true')}
/>
```

Suggested copy: **"Verify your email to unlock matches"** with two actions:
**Resend email** · **Change email**.

### 3. Verified badge on profile
On `/profile/:id`, render a `<VerifiedBadge/>` next to the name when the
`user.verification_status === 'verified'`. Small blue tick, Tinder-style.

### 4. Discovery gating
The recruiter/investor search backend filters out unverified candidates by default.
Add a `?show_unverified=1` query toggle for power-users.

### 5. Match notifications gating
Push notifications + email digests for "you got a like" only fire when verified.

---

## Tokens (theme/tokens file)

```ts
export const theme = {
  blue: '#1E9BD7',
  blueDark: '#1577B0',
  blueDeep: '#0E5A8E',
  navy: '#0B2138',
  midnight: '#03152A',

  yellow: '#FFC93A',
  green: '#2CC6A1',
  coral: '#FF6B6B',
  amber: '#FFB020',

  ink: '#0B1623',
  ink2: '#4A5A70',
  ink3: '#8B97A8',
  line: '#E5ECF3',
  bg: '#F4F8FC',
  card: '#FFFFFF',

  gradHero:     'linear-gradient(160deg, #2AB6EE 0%, #1E9BD7 38%, #0E5A8E 100%)',
  gradHeroDeep: 'linear-gradient(165deg, #1E9BD7 0%, #0E5A8E 50%, #06243F 100%)',
  gradStage:    'linear-gradient(180deg, #03152A 0%, #06243F 28%, #093E66 58%, #0E5A8E 100%)',
  gradPrimary:  'linear-gradient(180deg, #2AA9E5 0%, #1577B0 100%)',
  gradYellow:   'linear-gradient(90deg, #FFC93A, #FF9F43)',
};

export const radii = { sm: 10, md: 14, lg: 18, xl: 28 };
export const shadow = {
  card: '0 4px 14px rgba(11,22,35,0.06)',
  hero: '0 14px 34px rgba(11,22,35,0.10)',
  cta:  '0 14px 30px rgba(30,155,215,0.55)',
};
```

Type: **Inter** body (400/500/600/700/800), **Bricolage Grotesque** display (700/800).

---

## Brand assets to use (in `/assets`)

| File | Use |
|---|---|
| `wezume-mark.jpg` | Hero splash on Landing / Login / Success — concentric rings + circle + mic (centered crop from real brand asset) |
| `wezume-mark-v2.jpg` | Higher-res clean mic-only crop — use anywhere a non-ringed brand mark is needed |
| `wezume-brand-square.jpg` | App-icon-style brand square (1667×1667) |
| `wezume-wordmark-light.png` | Transparent white wordmark for in-app headers on blue backgrounds |
| `wezume-wordmark-dark.png` | Transparent blue wordmark for headers on white/light surfaces |
| `wezume-splash.jpg` | Original splash design (reference / fallback) |
| `wezume-logo-variants.jpg` | 4 brand variants reference sheet |
| `wezume-logo-square.jpg` | Earlier brand square reference |

**Header pattern:** Use the SVG wordmark component (preferred, sharper at small sizes, color-flexible) — see `/components/WezumeWordmark` in source. Falls back to PNG when needed.

---

## Component checklist (build order)

```
[ ] Theme/tokens file (colors, radii, shadows, fonts)
[ ] <PatternBg/>            — repeating doodle SVG bg
[ ] <PhoneStatusBar/>       — iOS-style fake status bar (dev only)
[ ] <Input/>                — 52h, 14r, focus ring 4px blue/12%
[ ] <PrimaryButton/>        — 52h, gradient + shadow
[ ] <StepDots/>             — 3-step progress indicator (light/dark variants)
[ ] <RoleTile/> + <StageTile/> — tall + wide variants
[ ] <LandingScreen/>        — 00a
[ ] <RoleSelectScreen/>     — 00b, auto-advance on tap
[ ] <DetailsScreen/>        — 00c, password strength meter
[ ] <SuccessScreen/>        — 00d, checklist card
[ ] <VerifyBanner/>         — persistent on /home until verified
[ ] <VerifiedBadge/>        — tick on profile
[ ] Analytics events:
    onboard_step_view, onboard_role_pick, onboard_complete,
    verify_email_sent, verify_email_clicked, verify_banner_dismissed
```

---

## Out of scope (later PRs)

- Phone OTP (WhatsApp Business / SMS) — keeping email-only for now
- Social login (Google) — LinkedIn is already wired
- Onboarding for institutional accounts (placement cells) — feature-flagged
