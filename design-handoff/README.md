# Wezume — Onboarding handoff bundle

This folder contains everything Claude Code needs to implement the
first-time onboarding flow with deferred email verification.

## Contents

```
handoff/
├── HANDOFF-ONBOARDING.md      ← Onboarding spec
├── HANDOFF-LOGIN-HOME.md      ← Login + Home spec
├── README.md                  ← (this file)
├── screens/                   ← Reference screenshots
│   ├── 00a-landing.png
│   ├── 00b-role-pick.png
│   ├── 00c-details.png
│   ├── 00d-success.png
│   ├── 01-login.png
│   └── 04-home.png
├── assets/                    ← Brand assets (drop into /public)
└── source/                    ← Reference React/JSX implementations
```

## How to use

1. **Read** `HANDOFF-ONBOARDING.md` — it has the routes, state shape, API contract,
   per-screen specs, and the deferred-verification behaviour.
2. **Copy** the contents of `assets/` into your `/public` or static asset directory.
3. **Reference** the files in `source/` for design tokens, hand-tuned CSS,
   and JSX implementations of every screen. Port them into your stack
   (the JSX here uses inline styles + plain React — translate to your styling
   system if needed).
4. **Follow** the component checklist near the end of the main spec for build order.

## Deferred verification — the short version

- Sign up flow does **not** block on email verification.
- After signup, fire `POST /api/verify/send` in the background.
- User goes straight to Success → Record first take.
- On `/home`, show a dismissible **"Verify your email to unlock matches"** banner
  until `user.verification_status === 'verified'`.
- Verified badge unlocks visibility in Discovery + match notifications.
