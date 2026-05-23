# Wezume — Login & Home Handoff (for Claude Code)

> **Scope:** 01 Login screen + 04 Home screen.
> Tokens, routes, components, and per-screen specs.

---

## Routes

```
/login                  # Returning users (clicked "Sign in" from Landing)
/home                   # Authenticated home — first screen after recording or sign-in
```

**Routing rules:**

| State | Destination |
|---|---|
| No `auth_token` | `/onboarding/welcome` |
| Click "Sign in" from Landing | `/login` |
| Successful login | `/home` |
| Submit first video from `/record` | `/home` (with welcome toast) |

---

# 01 · Login

### Visual spec

- Full-bleed background: **`linear-gradient(165deg, #1E9BD7 0%, #0E5A8E 50%, #06243F 100%)`** (`WZ.gradHeroDeep`)
- 2 atmospheric radial glow blobs (cyan top-right, yellow-tinted bottom-left)
- Subtle pattern bg at 18% opacity
- **Topbar**: back arrow (glass) + `<WezumeWordmark light size={22}/>` centered
- **Splash mark** (120px) — `assets/wezume-mark.jpg` cropped to circle + gentle 3.6s bob animation
- **Brand strapline**: `SPEAK UP. STAND OUT.` in yellow (#FFC93A), 11px, uppercase, 0.22em letter-spacing, flanked by 18×1px hairlines
- **Headline**: `Welcome back.` — `back.` styled with yellow gradient `linear-gradient(90deg, #FFC93A, #FF9F43)`, 30px / 800 / -0.03em
- **Glass form card** — `rgba(255,255,255,0.08)` bg, 1px white/14% border, `backdrop-filter: blur(22px) saturate(140%)`, 22px radius, 16px padding
- Inputs: dark variant — 52h, 14r, `rgba(255,255,255,0.06)` bg, `rgba(255,255,255,0.12)` border, white text
- Primary CTA: yellow gradient (`linear-gradient(90deg, #FFC93A, #FF9F43)`), 54h, 14r, ink-color text (`#0B1623`), 800 weight, `box-shadow: 0 14px 30px rgba(255,201,58,0.45)`
- **Remember me** checkbox (left) + **Forgot?** link (yellow, right)
- **Divider**: "OR" with 1px white/10% hairlines
- **LinkedIn button** (secondary): 52h, glass `rgba(255,255,255,0.06)` bg, 1px white/14% border, white text, LinkedIn glyph in blue chip
- **Footer**: `New here? Make your wezume →` (yellow, bold) → `/onboarding/welcome`

### Component contract

```tsx
type LoginProps = {
  onBack?: () => void;       // return to Landing
  onSignup?: () => void;     // → /onboarding/welcome
};
```

### State

```ts
type LoginState = {
  email: string;
  password: string;
  remember: boolean;
  loading: boolean;
};
```

### API

| Endpoint | Method | Payload | Returns |
|---|---|---|---|
| `/api/login` | POST | `{ email, password, remember }` | `{ token, user }` |
| `/api/login/oauth/linkedin` | redirect | — | OAuth handshake → `/home` |

### Empty / error states

- **Wrong password** → inline error under password field, "Email or password didn't match" (coral text)
- **Loading** → CTA shows spinner + label "Signing in…"
- **OAuth error** → toast at top "Couldn't connect to LinkedIn. Try again."

### Analytics events

- `login_view`
- `login_submit_password`
- `login_submit_linkedin`
- `login_success`
- `login_error` (with reason)
- `login_to_signup` (clicked "Make your wezume")

---

# 04 · Home

> **Important:** The Wezume **score number and trait progress bars are removed from Home.**
> Scores now live only inside the full AI Review screen. Home surfaces only the AI Review **headline tag** as a teaser.

### Visual spec

- Background: `#F4F8FC` (`WZ.bg`)
- **Hero band** (200px): `WZ.gradHero` (`linear-gradient(160deg, #2AB6EE 0%, #1E9BD7 38%, #0E5A8E 100%)`), bottom-corner radius 28px, pattern bg at 35% opacity
- **Topbar inside hero**: wezume logo (left) + bell + hamburger (right)
- **Greeting block**: "good morning" (small, light) + "Kumaran 👋" (26px, 700, -0.02em, white)
- Cards section sits at `marginTop: -52px` so the first card overlaps the hero

### Card 1 — AI Review headline (replaces score card)

- White card, 22r, 16p, soft shadow `0 14px 34px rgba(11,22,35,0.10)`, 1px line border
- Yellow radial glow at top-right corner (decorative)
- Header row: blue gradient icon chip (`Sparkles`) + label `LATEST AI REVIEW · 2H AGO` (10px, 800, uppercase, 0.08em)
- **Headline**: the AI-generated tag — e.g. `"Structured & assured speaker, growing EQ."` (19px, 800, -0.02em)
- Stat chip: green pill `✓ Clearer than 50%`
- Right: `See full review →` (blue, bold) → `/video/:latestVideoId/review`

```tsx
type AIReviewHeadline = {
  videoId: string;
  headline: string;       // <= 60 chars
  percentile: number;     // 0-100
  reviewedAt: string;     // ISO
};
```

### Card 2 — AI Coach

- Dark gradient `linear-gradient(135deg, #0B2138 0%, #1A2F47 100%)`, 18r, 14p, white text
- Yellow radial glow top-right
- Label: yellow icon chip + `AI COACH` (11px, 800, uppercase)
- Suggestion: 14px / 700, e.g. `"Eye contact is your biggest gap. Try a re-take today."`
- CTA: yellow button "Start take →" → `/record`

```tsx
type AICoachSuggestion = {
  tip: string;               // <= 80 chars
  ctaLabel: string;          // e.g. "Start take"
  ctaHref: string;           // e.g. /record
  focus?: 'eyeContact' | 'energy' | 'clarity' | 'pitch';
};
```

### Section — Your videos

- Heading row: "Your videos" (17px, 700) + subtitle "6 takes • 4 public" + right-side "See all" (blue, 700)
- **2-column grid**, 9:13 aspect, 10px gap
- Each card:
  - Background: video thumbnail (object-fit: cover)
  - Gradient overlay: `linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7))`
  - **Timestamp pill top-left** — dark glass, 8r, clock icon + relative time (`2h ago`, `1d ago`, `5d ago`, `2w ago`)
  - NEW badge top-right when `posted < 24h ago`: yellow chip
  - Center play button: 36×36, 50% radius, frosted glass
  - Footer text: video title (11px, 700) + view count (9px, 0.9 opacity)
  - **Featured** (latest take): 2px yellow border + blue shadow

```tsx
type VideoCard = {
  id: string;
  thumbnailUrl: string;
  title: string;
  postedAt: string;          // ISO
  views: number;
  isFeatured?: boolean;      // latest, highlight with yellow border
};
```

### Floating Record FAB

- Bottom-right, above bottom nav: 60×60, coral gradient (`linear-gradient(135deg, #FF6B6B, #FF8E58)`), 4px white border, mic icon, big shadow
- Tap → `/record`

### Bottom nav

- 4 tabs: Home (active), Discover, Inbox, Me
- White bg, 1px top border, blue active state, gray inactive

### Verify banner (if unverified)

If `user.verification_status === 'pending'`, render `<VerifyBanner/>` **above the AI Review card**:

- Soft yellow bg (`rgba(255,201,58,0.16)`), 1px yellow/45% border, 14r, 12p
- Copy: "Verify your email to unlock matches"
- Two text actions: "Resend" + "Change email"
- Dismissible icon (×) — stores `sessionStorage.dismissed_verify_banner = true`

### API

| Endpoint | Method | Returns |
|---|---|---|
| `/api/me` | GET | `{ user, verification_status }` |
| `/api/me/videos?limit=4` | GET | `{ videos: VideoCard[], total, public }` |
| `/api/me/latest-review` | GET | `{ headline, percentile, videoId, reviewedAt }` |
| `/api/me/coach-suggestion` | GET | `{ tip, ctaLabel, ctaHref, focus }` |
| `/api/me/counts` | GET | `{ unread_inbox, drafts }` |

### Loading & empty states

- **First-time user (just signed up, no video yet)**:
  - Card 1 (AI Review): hidden
  - Card 2 (AI Coach): "Record your first take to get instant AI feedback."
  - "Your videos" shows a single ghost card with dashed border, label "Tap to record your first take"
- **Loading**: skeleton placeholders for each card (shimmer animation)
- **API errors**: silent fallback to cached data + small "Couldn't refresh" pill at top

### Refresh

- Pull-to-refresh on the scroll container → re-fetch `/api/me`, `/api/me/latest-review`, `/api/me/videos`

### Analytics events

- `home_view`
- `home_ai_review_click`        (taps the headline card)
- `home_coach_cta_click`
- `home_video_click` (with videoId)
- `home_record_fab_click`
- `home_see_all_videos`
- `verify_banner_dismissed`
- `verify_banner_resend_click`

---

## Tokens (recap)

```ts
export const theme = {
  blue:    '#1E9BD7',
  blueDeep:'#0E5A8E',
  navy:    '#0B2138',
  navySoft:'#1A2F47',
  midnight:'#03152A',
  yellow:  '#FFC93A',
  green:   '#2CC6A1',
  coral:   '#FF6B6B',
  amber:   '#FFB020',
  ink:     '#0B1623',
  ink2:    '#4A5A70',
  ink3:    '#8B97A8',
  line:    '#E5ECF3',
  bg:      '#F4F8FC',
  card:    '#FFFFFF',

  gradHero:     'linear-gradient(160deg, #2AB6EE 0%, #1E9BD7 38%, #0E5A8E 100%)',
  gradHeroDeep: 'linear-gradient(165deg, #1E9BD7 0%, #0E5A8E 50%, #06243F 100%)',
  gradPrimary:  'linear-gradient(180deg, #2AA9E5 0%, #1577B0 100%)',
  gradYellow:   'linear-gradient(90deg, #FFC93A, #FF9F43)',
};
```

Type: **Inter** body, **Bricolage Grotesque** display (`.font-display`).

---

## Component checklist

```
01 Login
[ ] /login route + LoginScreen container
[ ] GlassCard component (frosted form wrapper)
[ ] DarkInput component (white-on-blue inputs)
[ ] YellowCTA component (gradHero CTA, 54h)
[ ] BrandStrapline component ("SPEAK UP. STAND OUT.")
[ ] LinkedIn OAuth button
[ ] Error handling (wrong password, OAuth fail)
[ ] Loading state on CTA
[ ] Analytics wiring

04 Home
[ ] /home route + HomeScreen container
[ ] HeroBand (gradient + topbar + greeting)
[ ] AIReviewHeadlineCard
[ ] AICoachCard
[ ] YourVideosGrid (with timestamp pills)
[ ] VideoCard component (thumbnail + overlay + timestamp + NEW badge + play)
[ ] RecordFAB
[ ] BottomNav (4 tabs)
[ ] VerifyBanner (conditional)
[ ] Pull-to-refresh
[ ] First-time / loading / error states
[ ] Analytics wiring
```

---

## Brand assets

| File | Use |
|---|---|
| `assets/wezume-mark.jpg` | Login splash mark (clip to circle) |
| `assets/wezume-wordmark-light.png` | Wordmark in white (Login topbar) |
| `assets/wezume-wordmark-dark.png` | Wordmark in blue (light surfaces) |

---

## Out of scope (later)

- Multi-device session list ("Where you're signed in")
- Biometric unlock (Face ID / Touch ID)
- Phone OTP login (kept email-only for now)
- Score/trait deep-link from Home directly to the metric tile in AI Review
