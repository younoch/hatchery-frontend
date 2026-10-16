# Progress

| Step | Name | Status | Approved on |
|---|---|---|---|
| 0 | Orientation | done | 2026-10-03 |
| 1 | Project setup | done | 2026-10-03 |
| 2 | Tailwind and shadcn-vue init | done | 2026-10-03 |
| 3 | Design tokens (Layer 1) | done | 2026-10-04 |
| 4 | i18n | done | 2026-10-06 |
| 5 | Folder structure and routing | done | 2026-10-06 |
| 6 | Button | done | 2026-10-06 |
| 7 | Field and Input | done | 2026-10-07 |
| 8 | Sheet and Tabs | done | 2026-10-09 |
| 9 | Layout components | done | 2026-10-09 |
| 10a | Styleguide: components | done | 2026-10-09
| 10b | Styleguide: heavy screen | done | 2026-10-10
| 11a | Mobile shell, app bar | done | 2026-10-10
| 11b | Mobile shell, tab bar | done | 2026-10-10
| 11c | Mobile shell, notifications | deferred|-|
| 12 | Desktop shell | deferred | - |
| 13 | Swipe navigation | deferred | - |
| 14-pre | Lazy route imports | done | 2026-10-13 |
| 14b | PWA: install prompt and offline-ready state | done | 2026-10-13 |
| 14c | PWA: production test on Vercel (real mobile and desktop) | done | 2026-10-13 |
| 15 | Schema | done | 2026-10-10 |
| 16 | Dexie storage layer | done | 2026-10-11 |
| 17a | Entry screen, form and save | done | 2026-10-11 |
| 17b | Entry screen, last value | done | 2026-10-12 |
| 18a | History: sub-tabs and card list | done | 2026-10-12 |
| 18b | History: StatusBadge and pending count | done | 2026-10-12 |
| 18c | History: fix-and-resend (local only) | done | 2026-10-12 |
| 19 | Error handling | done | 2026-10-15 |
| 20a | Auth: env, types, Zod schemas, AuthAdapter | in review (`access_token` key unverified) | - |
| 20b-1 | Auth: request wrapper and httpAuthAdapter | in review | - |
| 20b-2 | Auth: sessionManager (single-flight refresh, cross-tab lock) | in review | - |
| 20b-3 | Auth: authedRequest (one refresh and retry on 401) | in review | - |
| 20c | Auth: store, route guard, login view | not started | - |
| 20d | Auth: offline local session | not started | - |
| 21 | Sync engine | not started | - |
| 22 | Notifications | not started | - |
| 23 | Dashboard | not started | - |
| 24 | Desktop views | not started | - |
| 25 | Batch screen | not started | - |
| 26 | Verification pass | not started | - |

## Decisions log
- 2026-10-03: Zod version must be compatible with @vee-validate/zod (peer zod ^3.24.0); latest Zod is 4.x. Resolve at Step 1.
- 2026-10-06: Shared form primitives are built as reusable UI pieces in `src/shared/components/ui/` with generic label/hint/error slots and no screen-level hardcoded content.
- 2026-10-03: Zod pinned to 3.25.76 for @vee-validate/zod compatibility (resolved in Step 1).
- 2026-10-04: Bangla and English use the same font sizes; only Bangla line-height differs (1.6).
- 2026-10-04: Removed legacy alias vars --bg/--fg/--line/--focus; code uses shadcn semantic names directly.
- 2026-10-05: One fixed unit per parameter (°C, ppt, mg/L), no unit picker, no conversion. Field names carry the unit (temperatureC, salinityPpt, oxygenMgL).
- 2026-10-05: i18n setup with vue-i18n (legacy: false, default locale: bn, fallback: bn). Language toggle persisted in localStorage, lang attribute kept in sync.
- 2026-10-06: esbuild build script allowed in pnpm-workspace.yaml because vite 8.3.2 resolves tsx/esbuild; revisit when upgrading vite.
- 2026-10-06: Device auto-detection uses the existing 48rem breakpoint; only narrow Android viewports default to mobile.
- 2026-10-09: The dev-only `/dev/styleguide` route is excluded from the prefixed mobile/desktop redirect, and the layout class audit now checks both built CSS assets and view files.
- 2026-10-10: vertical slice; order 15, 16, 17, 18, then 14 (PWA); 11c/12/13 deferred until client feedback.
- 2026-10-11: tank list is a fixed config (src/shared/config/tanks.ts) for the prototype; backend-driven tanks and organization module come after client feedback.
- 2026-10-11: Step 17 split into 17a (form, validation, save) and 17b (last-value prefill and confirm rule); step sizes and 24h limit are samples until the owner confirms.
- 2026-10-12: Step 17b step sizes (pH 0.1, temperature 0.5, salinity 1, oxygen 0.1) and the 24h prefill limit are still samples; owner has not confirmed them.
- 2026-10-12: Formatting is no longer an ESLint error (`prettier/prettier` rule off); Prettier is run by hand on specific files.
- 2026-10-12: Step 18 split into 18a (sub-tabs and card list from real Dexie data), 18b (shared StatusBadge, pending count) and 18c (fix-and-resend, local update only). The real send happens in Step 21 (sync engine).
- 2026-10-12: Until Step 21, real records are only `pending`. The styleguide shows all four badge states as samples so the visuals can be checked.
- 2026-10-12: Step 18c "Fix and resend" only sets a failed record back to pending (local). Editing the rejected values and the real send belong to Step 21.
- 2026-10-12: Step 18c "Fix and resend" only sets a failed record back to pending (local). Editing the rejected values and the real send belong to Step 21.
- 2026-10-13: Step 14 split into 14-pre (lazy route imports, main chunk is 533 kB), 14a, 14b and 14c (real Android test, done by the owner with a checklist). `vite-plugin-pwa` is in the fixed stack but is installed only after the owner agrees.
- 2026-10-13: Route views are lazy imported; main chunk dropped from 533 kB to 229 kB. MobileShell stays eager.
- 2026-10-13: Step 14a uses the precached app shell (`navigateFallback`) as the offline fallback; no separate offline page. Precache only woff2 fonts. Icons are placeholders until a logo exists; theme color is the primary token.
- 2026-10-13: Step 14a uses the precached app shell (`navigateFallback`) as the offline fallback; no separate offline page. Only woff2 fonts are precached. Icons are placeholders until a logo exists; theme color is the primary token. `vite-plugin-pwa` 2.0.0 was installed (works with Vite 8).
- 2026-10-13: Readings stay `pending` after going online until the sync engine exists (Step 21). This is expected, not a bug.
- 2026-10-13: Owner confirmed the step sizes (pH 0.1, temperature 0.5, salinity 1, oxygen 0.1).
- 2026-10-13: Owner decision: the last value has no age limit. The latest reading of the tank is always pre-filled (still unconfirmed until the user acts) and every save replaces it. The 24 h rule and the "old value" hint are removed.
- 2026-10-13: Step 14b drops `mkcert` HTTPS for now. The real phone test (14c) uses `adb reverse`, because `localhost` is a secure context on the phone. Gating offline entry until "offline ready" moves to Step 20 (it needs login and the first data fetch).
- 2026-10-14: Owner decision: whatever cannot be tested properly on localhost is tested on production. The app is deployed to Vercel and checked with the real link on a real mobile and desktop. This replaces the `adb reverse` plan for Step 14c.
- 2026-10-14: Owner confirmed the step sizes (pH 0.1, temperature 0.5, salinity 1, oxygen 0.1) and decided the last value has no age limit.
- 2026-10-15: Still UNVERIFIED (reports conflict, no real HTTP output yet): real Set-Cookie flags and Max-Age unit; the `access_token` key name; `/user/me` for the super admin; list response shape; login throttle values; `TOKEN_EXPIRATION` default. The auth schemas mark these with `TODO(verify)`.
- 2026-10-15: Offline token expiry policy: data entry keeps working offline (saves go to Dexie); a 401 during sync means "session ended, log in again" and pending readings stay untouched.
- 2026-10-16: Native `fetch` is used for the API client, no axios (no new dependency, bundle stays small; the refresh interceptor is custom either way; WebSocket/queue do not depend on the HTTP client).
- 2026-10-16: `env.ts` lives in `src/shared/utils/env.ts` (not `shared/config`). It is imported first in `main.ts`; a missing or invalid `VITE_API_URL` stops the app at startup. The trailing slash is stripped.
- 2026-10-15: `/user/me` verified with real output: `role` is `null` for a user without a role; `isSuperAdmin` is not returned. `meSchema` maps it to `AuthUser` (`roleName`, `permissions`, `isSuperAdmin`).
- 2026-10-16: Error kinds: 401 on login = `invalid_credentials`; 401 on refresh = `session_ended`; 401 on an authenticated call = `unauthorized`, which triggers exactly one refresh and one retry. A network error during refresh keeps the in-memory token (no logout while offline).
- 2026-10-15: Backend audit (code-read only, app not run; only `/user/me` has since been verified with real output): login is by email; login and refresh return `{ success, statusCode, data: { access_token }, timestamp }` with the refresh token only in an httpOnly cookie named `refresh_token` (Path `/auth/refresh`); the profile endpoint is `GET /user/me`, not `/auth/me`; permissions come only from `/user/me` (`role.permissions`), not from login or the JWT.
- 2026-10-15: Step 20 is built against the real auth API (no mock for auth). Readings, tanks and batch sync do not exist in the backend, so Step 21 needs a mock adapter.
- 2026-10-15: Logout calls `POST /auth/refresh/logout` (the cookie Path is `/auth/refresh`, so `/auth/logout` would not receive the cookie).
- 2026-10-15: Backend gaps the frontend works around, not fixes: refresh token is fixed 14 days from login (not sliding); no grace window, so a lost refresh response can log the user out; no distinguishable error code for a revoked or reused session; a new login does not revoke older sessions; password change keeps other sessions alive; validation errors are English strings, not `{ field, code, params }`; an unverified user can log in.
- 2026-10-15: A Vercel proxy under a prefix such as `/api` will not work while the refresh cookie Path is fixed to `/auth/refresh`. Cross-site setup needs `COOKIE_SAME_SITE=none`, `COOKIE_SECURE=true` and the Vercel origin in `CORS_ORIGINS`.

## Parking lot
- Switch to single "typescript-eslint" package
- Clean up woff files in dist (keep only woff2)
- Check vue-i18n CSP behavior in the browser console by serving dist with script-src 'self' and no unsafe-eval; now unblocked because the Step 5 placeholder calls t()
- class-variance-authority is in devDependencies but used at runtime; ask owner before moving to dependencies
- Decide whether to add a shadow token for StickyActionBar's rgba(0,0,0,0.12); no shadow token was added in Step 9
- 2026-10-10: vertical slice, only water quality; tab bar from navItems config, More sheet holds desktop switch only; more modules on client feedback.
- Audit still reports min-w-0, h-3.5, w-3.5, mt-0.5 (location unknown, not in ui/*.vue top level) and required-indicator (Field's own <style> class, audit should ignore it)
- Move the "same as last" chip into the label row of StepperInput (needs a look at Field.vue); it currently sits in its own row above the control.
- `chip-row` in StepperInput uses scoped CSS; move it to a token or layout component later.
- Dedupe `formatWhen` (WaterEntryView) and `formatReadingTime` (datetime.ts), and the water fields list that exists in both views.
- Dedupe `formatWhen` (WaterEntryView) and `formatReadingTime` (datetime.ts), and the water fields list that exists in both views.
- Architecture/dependency diagram after Step 20.
- Wrap each route view in ErrorBoundary so a view crash does not take down the tab bar (plan section 8a).
- Get real curl output from the backend (login with Set-Cookie, `/user/me` for a user with no role and for the super admin, `/user` pagination) and resolve the `TODO(verify)` marks. Ask the backend session to answer: throttle values, `TOKEN_EXPIRATION` default.
- `AuthError` and `AuthErrorKind` are used for every API call now; rename to `ApiError` and move out of `authAdapter.ts` before Step 21.
- The refresh race is only reduced, not removed: `navigator.locks` serializes tabs, but a lost refresh response still ends the session (backend task 8: grace window).
- Real `curl -i` output for login is still missing; it confirms the `access_token` key and the cookie flags (`SameSite`, `Secure`, `Path`, `Max-Age` unit).
- Backend follow-up list for the backend session: expose `isSuperAdmin` (or an effective permission list) on `/user/me`; make the refresh cookie Path configurable; grace window and family revoke on refresh; sliding TTL; session takeover and a `session_revoked` code; per-field validation codes; decide whether unverified users may log in; confirm the real login throttle and the list response shape (two reports disagree).
- `env.ts` lives in `src/shared/utils`, not `src/shared/config`; keep the plan's folder list in sync.
