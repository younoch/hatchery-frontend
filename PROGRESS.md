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
| 10a | Styleguide: components | done | 2026-10-09 |
| 10b | Styleguide: heavy screen | done | 2026-10-10 |
| 11a | Mobile shell, app bar | done | 2026-10-10 |
| 11b | Mobile shell, tab bar | done | 2026-10-10 |
| 11c | Mobile shell, notifications | deferred | - |
| 12 | Desktop shell | deferred | - |
| 13 | Swipe navigation | deferred | - |
| 14-pre | Lazy route imports | done | 2026-10-13 |
| 14a | PWA: plugin and manifest | done | 2026-10-13 |
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
| 20a | Auth: env, types, Zod schemas, AuthAdapter | done | 2026-10-17 |
| 20b-1 | Auth: request wrapper and httpAuthAdapter | done | 2026-10-17 |
| 20b-2 | Auth: sessionManager (single-flight refresh, cross-tab lock) | done | 2026-10-17 |
| 20b-3 | Auth: authedRequest (one refresh and retry on 401) | done | 2026-10-17 |
| 20c | Auth: store, route guard, login view | done | 2026-10-17 |
| 20d | Auth: offline local session | done | 2026-10-17 |
| 20.5 | Global Toast: component, useToast, ToastHost, styleguide, login errors | done | 2026-10-17 |
| 20.6 | Rename AuthError to ApiError | done | 2026-11-08 |
| 21d | Backend contract v2 switch: `/users` paths, username login, new `/users/me`, forced password screen, online-only logout, error codes | done | 2026-11-13 |
| 20.7 | recordedAt guards (future 5 minutes, before 2020) and phone clock warning | not started | - |
| 21 | Sync engine against a mock adapter (chunks of 20, per-item results by index, 429 and 413 rules) | not started | - |
| 21b | Tanks from the backend (Dexie `tanks` table) | not started | - |
| 21c | Switch sync and tanks to the real endpoints | not started | - |
| 21e | Clear cache and reload button (needs backend `GET /readings`, F→B-28) | blocked by backend | - |
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
- 2026-10-12 (superseded 2026-10-13): Step 17b step sizes (pH 0.1, temperature 0.5, salinity 1, oxygen 0.1) and the 24h prefill limit are still samples; owner has not confirmed them.
- 2026-10-12: Formatting is no longer an ESLint error (`prettier/prettier` rule off); Prettier is run by hand on specific files.
- 2026-10-12: Step 18 split into 18a (sub-tabs and card list from real Dexie data), 18b (shared StatusBadge, pending count) and 18c (fix-and-resend, local update only). The real send happens in Step 21 (sync engine).
- 2026-10-12: Until Step 21, real records are only `pending`. The styleguide shows all four badge states as samples so the visuals can be checked.
- 2026-10-12: Step 18c "Fix and resend" only sets a failed record back to pending (local). Editing the rejected values and the real send belong to Step 21.
- 2026-10-13: Step 14 split into 14-pre (lazy route imports, main chunk is 533 kB), 14a, 14b and 14c (real Android test, done by the owner with a checklist). `vite-plugin-pwa` is in the fixed stack but is installed only after the owner agrees.
- 2026-10-13: Route views are lazy imported; main chunk dropped from 533 kB to 229 kB. MobileShell stays eager.
- 2026-10-13: Step 14a uses the precached app shell (`navigateFallback`) as the offline fallback; no separate offline page. Only woff2 fonts are precached. Icons are placeholders until a logo exists; theme color is the primary token. `vite-plugin-pwa` 2.0.0 was installed (works with Vite 8).
- 2026-10-13: Readings stay `pending` after going online until the sync engine exists (Step 21). This is expected, not a bug.
- 2026-10-13: Owner decision: the last value has no age limit. The latest reading of the tank is always pre-filled (still unconfirmed until the user acts) and every save replaces it. The 24 h rule and the "old value" hint are removed.
- 2026-10-13 (superseded 2026-10-14): Step 14b drops `mkcert` HTTPS for now. The real phone test (14c) uses `adb reverse`, because `localhost` is a secure context on the phone. Gating offline entry until "offline ready" moves to Step 20 (it needs login and the first data fetch).
- 2026-10-14: Owner decision: whatever cannot be tested properly on localhost is tested on production. The app is deployed to Vercel and checked with the real link on a real mobile and desktop. This replaces the `adb reverse` plan for Step 14c.
- 2026-10-14: Owner confirmed the step sizes (pH 0.1, temperature 0.5, salinity 1, oxygen 0.1) and decided the last value has no age limit.
- 2026-10-15 (superseded by the 2026-10-16 entries): Still UNVERIFIED (reports conflict, no real HTTP output yet): real Set-Cookie flags and Max-Age unit; the `access_token` key name; `/user/me` for the super admin; list response shape; login throttle values; `TOKEN_EXPIRATION` default. The auth schemas mark these with `TODO(verify)`.
- 2026-10-15: Offline token expiry policy: data entry keeps working offline (saves go to Dexie); a 401 during sync means "session ended, log in again" and pending readings stay untouched.
- 2026-10-16: Native `fetch` is used for the API client, no axios (no new dependency, bundle stays small; the refresh interceptor is custom either way; WebSocket/queue do not depend on the HTTP client).
- 2026-10-16: `env.ts` lives in `src/shared/utils/env.ts` (not `shared/config`). It is imported first in `main.ts`; a missing or invalid `VITE_API_URL` stops the app at startup. The trailing slash is stripped.
- 2026-10-15: `/user/me` verified with real output: `role` is `null` for a user without a role; `isSuperAdmin` is not returned. `meSchema` maps it to `AuthUser` (`roleName`, `permissions`, `isSuperAdmin`).
- 2026-10-16: Error kinds: 401 on login = `invalid_credentials`; 401 on refresh = `session_ended`; 401 on an authenticated call = `unauthorized`, which triggers exactly one refresh and one retry. A network error during refresh keeps the in-memory token (no logout while offline).
- 2026-10-15: Backend audit (code-read only, app not run; only `/user/me` has since been verified with real output): login is by email; login and refresh return `{ success, statusCode, data: { access_token }, timestamp }` with the refresh token only in an httpOnly cookie named `refresh_token` (Path `/auth/refresh`); the profile endpoint is `GET /user/me`, not `/auth/me`; permissions come only from `/user/me` (`role.permissions`), not from login or the JWT.
- 2026-10-15: Step 20 is built against the real auth API (no mock for auth). Readings, tanks and batch sync do not exist in the backend, so Step 21 needs a mock adapter.
- 2026-10-15: Logout calls `POST /auth/refresh/logout` (the cookie Path is `/auth/refresh`, so `/auth/logout` would not receive the cookie).
- 2026-10-15 (partly outdated: the refresh TTL is sliding, see 2026-10-16; current state is in COORDINATION.md): Backend gaps the frontend works around, not fixes: refresh token is fixed 14 days from login (not sliding); no grace window, so a lost refresh response can log the user out; no distinguishable error code for a revoked or reused session; a new login does not revoke older sessions; password change keeps other sessions alive; validation errors are English strings, not `{ field, code, params }`; an unverified user can log in.
- 2026-10-15: A Vercel proxy under a prefix such as `/api` will not work while the refresh cookie Path is fixed to `/auth/refresh`. Cross-site setup needs `COOKIE_SAME_SITE=none`, `COOKIE_SECURE=true` and the Vercel origin in `CORS_ORIGINS`.
- 2026-10-16: Verified in DevTools (local): cookie `refresh_token`, HttpOnly, Secure off, SameSite=Lax, Path starts with `/aut` (full value and Expires not yet read). Production needs `COOKIE_SAME_SITE=none` and `COOKIE_SECURE=true`.
- 2026-10-16: Verified with real output: login/refresh body is `data.access_token`. Pinia added with the owner's approval. Login has no password-rule check on the client (the backend owns it). Logout lives in the More sheet and always clears the local session; IndexedDB is untouched.
- 2026-10-16: Logout keeps pending and failed readings. A different user signing in on the same phone cannot see them (filtered by `createdById`), sync stays paused while they exist, and only synced cache of other users is cleared. Deleting unsynced readings is possible only through an explicit confirmed action, never automatically. The local session stores `userId`, a permission snapshot and a reserved `organizationId` (null for now); it is cleared on explicit logout and on `session_ended`.
- 2026-10-16: Backend verified with real HTTP output: login and refresh return 201 with `data.access_token`; cookie `refresh_token` Max-Age=1209600 (seconds), Path=/auth/refresh, HttpOnly, SameSite=Lax; refresh TTL is sliding (correcting an earlier "fixed" claim); a reused or logged-out refresh token gives 401; list shape is `{ items, meta }`; there is no login-specific throttle (global 100 per 60 s, no 429 seen in 12 tries); unverified users can log in; the super admin gets `role: null` from `/user/me` (so no permissions until backend task 7); production must set `TOKEN_EXPIRATION` explicitly (unset means 3600).
- 2026-10-16: Toast is its own step (20.5), not part of Auth. Auth is finished with the inline form error first; the global Toast is built next and then used in login (keeping the persistent error line there).
- 2026-10-17: Step 20 done after a full manual test. Readings are written and read under the signed-in user's id (no stub id). Old `stub-user` test readings remain on disk but are invisible.
- 2026-10-17: This chat is frontend only. Backend changes are done in a separate chat. The frontend keeps a "backend needs" list in the parking lot and builds against mock adapters until the backend delivers.
- 2026-10-26: Backend contract v2 frontend notes: a user with `organizationId` null (super admin) gets an empty state and no tanks or sync calls; `PATCH /users/me/password` returns a new access token, which replaces the in-memory one (no extra refresh). Both are built at delivery, together with username login and the new `/users/me` shape.
- 2026-10-28 (superseded by the next entry): Backend answers (from COORDINATION, to be confirmed in backend progress.md): sync body limit 100 KB (413 `payload_too_large`); a malformed whole request gives 400 `validation_failed` with `errors[]` paths such as `items.2.id`; a `rejected` item is not stored and can be resent with the same id; no new codes for tankId and note (`invalid_uuid`, `required`, `too_long {max}`); `GET /tanks` needs organization membership only (400 `organization_required` for a super admin without an organization, 403 `no_organization` for a user without one). Frontend defence: if a whole-request 400 names `items.N`, that item is marked `failed` and the rest are resent; the whole chunk is never marked `failed`.
- 2026-10-28: Correction to the earlier 2026-10-28 sync note: a whole-request 400 (`validation_failed`) happens only for a bad envelope (`items` missing, not an array, empty or over 100), so it signals a frontend bug: the chunk stays `pending` and is reported to errorStore. Every item problem is a per-item `rejected`; results are matched to items by `index`, not `id`. A 413 `payload_too_large` halves the chunk. Rate limits (backend, to be confirmed in progress.md): sync 30/min per user, default 120/min per user, login 10/min per IP, refresh 60/min per IP. A throttled refresh falls back to the local session, like a network error.
- 2026-10-29: The backend contract lives in the backend `progress.md` and Swagger. `COORDINATION.md` carries requests, answers and notices and wins for new changes. The plan's Appendix A, its 2026-10-15 backend status table and `docs/backend-handoff.md` are removed.
- 2026-10-29: Backend confirmed in `progress.md` (COORDINATION F→B-18, 23, 24 done): sync body limit 100 KB, whole-request 400 only for a bad envelope, rate limits (per user id: default 120/min, sync 30/min; per IP: login 10/min, refresh 60/min).
- 2026-10-30: Backend accepted COORDINATION F→B-25 (`progress.md` Rate limits to follow): the login limit is 10/min per username plus a loose 120/min per-IP ceiling (supersedes "login 10/min per IP" above); account lockout is deferred until after the pilot. No frontend change: a login 429 still shows a toast using `Retry-After`.
- 2026-10-29: Step 21 rules (COORDINATION B→F-08, 10, 19, 21): chunks of 20 sent one after another; results matched by `index`; a 429 is transient (keep pending, wait for `Retry-After`, fallback backoff capped at about 60 s, never `failed`); after the first send attempt a pending reading is no longer editable (this replaces the Step 16 rule; `rejected` items keep fix-and-resend); a whole-request 400 is a frontend bug (chunk stays pending, reported to errorStore).
- 2026-10-29: Step 20.7 (COORDINATION B→F-09): a future `recordedAt` is refused beyond 5 minutes at save (the server allows 10) and a wrong phone clock is warned about.
- 2026-10-29: Owner decisions recorded: no signup (the super admin creates an organization and its single admin; the admin adds users); one user belongs to one organization; login by lowercase username (at delivery, Step 21d); no edit or delete after sync in the pilot, a correction is a new reading (TEMPORARY, decide before the dashboard); `isLate` and `needsReview` are dropped from the pilot (the fields stay in the local `Reading` type); the last value stays per user and local; organization-wide viewing is online only, later, behind `reading:read-all`.
- 2026-11-10: Step 21d moves before Step 20.7 and Step 21 (COORDINATION F→B-27): the old `/user…` paths and email login no longer exist, so the app cannot sign in until it is done.
- 2026-11-10: Owner decisions: (1) work starts on the real backend (local for now), auth first; (2) the organization and organization-role management screens will be built, in a later step after 21d; (3) validation stays at the backend's impossible-value limits for the pilot, and industry-standard review ranges come after release from user feedback.
- 2026-11-10: Step 21d decisions: (1) forced password change is a full screen, only logout is reachable, online only, the new access token from the response is kept; (2) logout is online only; with unsent readings it asks "N readings are not sent yet. They will be deleted if you log out. Log out anyway?", then clears all local data and the next user fetches everything online (Step 21 adds: sync pending readings before logout); (3) a forced logout (`session_revoked`, `user_inactive`, session ended) clears all local data too, so unsent readings are lost (accepted); (4) login: the frontend only trims and lowercases the username, the format and password rules belong to the backend and are not copied, and errors map by `code` (`invalid_username`, `username_taken`, `weak_password`, `too_short`), never by message; `ApiError` also carries the response `code` and `errors[]`.
- 2026-11-10: A "Clear cache and reload" button (Step 21e) clears local readings and tanks, keeps the login session, and fetches again from the server; online only, with the same unsent-readings warning. It waits for backend `GET /readings` (F→B-28). Until then, history and the last value are empty after any logout. A per-reading `userId` is not needed because logout clears everything.
- 2026-11-12: Forced password change (Step 21d-4) decisions: (1) no local session is saved while `mustChangePassword` is true; it is saved only after the password is changed, so an offline start shows the login screen; (2) the form has three fields (current, new, new again); the frontend only checks that the two new passwords match, it does not copy the length or character rules and maps `weak_password`, `too_short` and `too_long` from the response; (3) a wrong current password (403 `permission_denied`) gets its own message on this screen only; (4) after success the new access token is kept, `/users/me`is fetched again, then the app opens.
- 2026-11-13: Step 20.7 decisions: (1) at save, a `recordedAt` more than 5 minutes in the future or before 2020-01-01 UTC is refused (the backend limits are 10 minutes and 2020-01-01, B→F-28); (2) when online, the `timestamp` of server responses is compared with the phone clock, and the reading form warns only when they differ by more than 5 minutes (the backend's 10 minutes minus the frontend's 5); it never blocks and is shown on the reading form only; (3) offline, only the save-time refusal applies.

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
- Architecture/dependency diagram after Step 20.
- Wrap each route view in ErrorBoundary so a view crash does not take down the tab bar (plan section 8a).
- The refresh race is only reduced, not removed: `navigator.locks` serializes tabs, but a lost refresh response still ends the session (backend task 8: grace window).
- `env.ts` lives in `src/shared/utils`, not `src/shared/config`; keep the plan's folder list in sync.
- Forgot-password flow: the backend has the endpoints, the frontend has no screen; decide where the email link lands (`FRONTEND_URL`).
- Warn on logout when pending readings exist.
- Production login needs a hosted backend with `COOKIE_SAME_SITE=none`, `COOKIE_SECURE=true` and the Vercel origin in `CORS_ORIGINS`; do not push the route guard to Vercel until then.
- Organization-wide viewing of readings (`reading:read-all`, online only) comes later. The last value stays per user and local. Tanks come from the backend in Step 21b.
- Login view layout: the form sits at the top with empty space below; give it a full-height column (like WaterEntryView's `flex flex-1 flex-col justify-between` inside a `h-dvh` container) so the button sits at the bottom.
- `manualChunks` vendor split: the build chunk names are misleading.
- Save-failure toast (`error.saveFailed`) when saving a reading to Dexie fails.
- Zod 3.25.76 (frontend) vs Zod 4 (backend): matters only if schemas are ever shared.
- Decide before Step 23 (dashboard): are corrections after sync allowed? The pilot has no edit after sync.
- Decide at Step 21: the Dexie version numbers (2 = session; COORDINATION B→F-04 planned tanks as version 3, and the error code of a failed reading also needs a version), where the rejected values are edited (fix-and-resend UI), and where the error code is stored.
- Owner decision pending in COORDINATION: B→F-11 (a domain for `app.` and `api.`).
- COORDINATION.md rule 1 `diff` path (`../hatchery-backend`) is wrong on this machine; put in the real backend repo path.
- `SummaryCard`: AGENTS.md lists it as shared from the start, but COMPONENTS.md has no entry. Check whether it exists.,