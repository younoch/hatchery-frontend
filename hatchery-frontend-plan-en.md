# Hatchery Software — Frontend Plan

> **Status (2026-10-03):** all sections below reflect closed decisions; section 10 lists only deferred items. This document is the single source of truth for a fresh session — it does not depend on any earlier chat history. Appendix A holds the backend change instruction (to give to a backend LLM/session).
>
> **Working notes for the next session:** reply in pure Bangla script (even if the user writes Banglish); backend = trainer-student mode (Socratic, simple-first then industry-level), frontend = industry-standard from the start; for existing files show line-level diffs, do not rewrite whole files unless explicitly asked; suggest commit timing and conventional-commit messages proactively.

## 1. Context

- Backend boilerplate (nestjs-boilerplate) complete — auth, RBAC, password recovery, BullMQ background jobs, health checks all in place
- First species target: **Shrimp**
- First module: **Water Quality** (pH, salinity, O2 level, etc. field-test tracking)
- User profile:
  - ~70% field users (mobile, **personal phones**, not shared devices): internet may be available, slow, or absent — design for all three, offline-first
  - ~30% users may use the same account on two personal devices (phone + desktop/tablet), but **only one active session per account at a time** (see section 6, Single active session)
  - The two device types imply different user demands and mindsets (phone: quick field entry; desktop/tablet: review, management, reporting). This is a **feature-design lens only**, never an access rule — all access control comes from backend RBAC permission keys
- Goal: demo to hatcheries in Cox's Bazar to build trust, then expand features

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Vue 3 + Vite + TypeScript (strict mode) |
| State | Pinia |
| Validation | **Zod** — single source of truth for form shapes, used for form input validation and `.env` validation on both frontend and backend |
| Forms | **VeeValidate v4** via shadcn-vue's Form component, with `@vee-validate/zod` (`toTypedSchema`) so the shared Zod schema drives validation and types; fallback if it conflicts with a higher-priority tool: a small custom composable using `schema.safeParse()` |
| CSS | Tailwind (mobile-first) |
| UI components | shadcn-vue — treated as the **design system foundation**, not a component library (see section 2a); built on Reka UI headless primitives, code copied into the project (not an installed dependency), so bundle size stays fully controlled; Reka UI primitives ship with keyboard nav, focus trap, and ARIA built in, covering most of section 8c for free |
| i18n | vue-i18n (Bangla default, English toggle) |
| Chart | D3 (calculation only — scale/shape/array; Vue template renders the SVG) |
| Offline storage | IndexedDB via Dexie.js, with schema version migrations from day one |
| PWA | vite-plugin-pwa |
| HTTP | fetch/axios wrapper + interceptor |
| Package manager | pnpm |

**Dropped:** Google Charts (doesn't work offline, CDN-dependent), Nuxt (no SEO/SSR need — the whole app sits behind login).

**Conflict priority (decided):** if tools conflict, the order is shadcn-vue > Tailwind > Zod > VeeValidate, and lower ones are sacrificed first. Zod outranks VeeValidate because the schema is shared with the backend; VeeValidate is only the form-binding layer. Before installing, check shadcn-vue's current Form docs and that the Zod major version is compatible with `@vee-validate/zod`.

### Zod usage details
- `shared/schemas/waterQuality.schema.ts` — single Zod schema for the water-quality reading shape (pH, salinity, O2, recordedAt, etc.), imported by both mobile and desktop form components
- Form validation: VeeValidate with `toTypedSchema(schema)`, validated on blur and on submit (not on every keystroke); field-level errors rendered through shadcn-vue's Form components. Editing a pending record passes the Dexie record as `initialValues`
- `.env` validation: `VITE_API_URL` and other env vars validated at startup, matching the backend's existing Zod env-validation pattern
- API response validation: validate critical API responses against the same schema before writing to IndexedDB, so malformed data never enters local storage

## 2a. Design System Foundation

Perceived product quality in a commercial context depends heavily on UI visual consistency, not just functional architecture — so a fixed token set is defined up front rather than picking colors ad hoc per screen. shadcn-vue is adopted here specifically as a **design system foundation**, not merely a component library — the distinction matters architecturally, not just semantically:

```
Layer 1: Design Tokens (CSS variables)
         primary, success, warning, danger, neutral, spacing, radius, font

Layer 2: Primitive Components (shadcn-vue + Reka UI)
         Button, Input, Dialog, Tabs — consume tokens via semantic Tailwind
         classes (bg-primary, text-destructive); no hardcoded hex/px values

Layer 3: Composite Components (project-specific)
         BottomTabBar, MoreSheet, WaterQualityCard, sync-status badge —
         built from Layer 2 primitives, carrying domain-specific logic/layout
```

**Why this framing drives real decisions, not just terminology:**
- Because primitives reference CSS variables rather than hardcoded values, changing the brand palette later (once a logo exists) means updating the token definitions in one place — no component needs to be touched individually
- New composite components follow the same variant pattern shadcn-vue components use (`class-variance-authority`/`cva` — e.g. `size: sm/md/lg`, `intent: primary/danger`), so components built at different times by different contributors stay visually consistent
- Building a new composite component starts from an existing Layer 2 primitive (e.g. BottomTabBar sits on shadcn-vue's Tabs, MoreSheet on its Dialog/Sheet); a fully custom build only happens when no suitable primitive exists
- Token changes (color, spacing, radius) are approved and made in one place (`tailwind.config.ts` + CSS variables) — never as a per-component override — which prevents visual drift as the app grows past the current 5-6 core pages

### Color palette
Primary is kept hue-distinct from the status colors on purpose, so sync status is never visually confusable with brand color.

```
primary-50:  #ECFEFF
primary-500: #0891B2   ← main brand shade (teal/cyan — water + professionalism, not generic blue)
primary-600: #0E7490
primary-900: #164E63

success (synced):  #16A34A
warning (pending):  #D97706
danger  (failed):   #DC2626

neutral-50:  #FAFAFA
neutral-200: #E5E5E5
neutral-500: #737373
neutral-900: #171717
```

Only these four families (primary, success/warning/danger, neutral) are used — no ad hoc new colors added per screen.

### Typography
- Font stack must support Bangla and English in the same element (e.g. mixed strings like "Water Quality — পানির মান"), so a single fallback chain is used rather than switching fonts on language toggle: `['Inter', 'Noto Sans Bengali', 'sans-serif']`
- Tailwind's default font is Latin-only, so Noto Sans Bengali is pulled in explicitly (self-hosted preferred over Google Fonts CDN, for the offline-first/fast-load priorities in section 1)
- Scale: 2-3 heading levels, body, caption — kept simple, not over-engineered; concrete sizes are in "Density & Type Scale" below

### Spacing
- Tailwind's default 4px-based scale is used as-is — no custom spacing scale needed

### Density & Type Scale (decided: compact design)
Users work in this system regularly, so the design is **compact** — density serves productivity. Compact must never compromise legibility or touch accuracy, so the rules below set the floor.

**Basis is input type, not screen size:** the scale switches on `@media (pointer: coarse)` vs `fine` (Tailwind v4 `pointer-coarse:` variant), not on a "tablet" breakpoint — a tablet with a keyboard/mouse or a touchscreen laptop is handled correctly this way. There is no separate tablet column.

| Element | Fine pointer (mouse) | Coarse pointer (touch) |
|---|---|---|
| Body | 14px | 15px |
| Table / card-list text | 13px | 14px |
| Form label | 13px | 14px |
| Caption / badge (minimum) | 12px | 12px (Bangla: 13px) |
| Section heading | 16px | 18px |
| Page title | 20px | 20px |
| Input / button height | 36px | 44px |
| Gap between tappable elements | n/a | ≥ 8px |

**Rules:**
- **Bangla adjustment:** Bangla script (conjuncts, matra, marks above/below) renders smaller and denser than Latin at the same px, so under `html[lang='bn']` sizes get about +1px per level and line-height rises (Latin ~1.4-1.5, Bangla ~1.6) so matra and below-base marks are not clipped
- **No 11px text anywhere**; 12px is the absolute minimum
- **rem-based tokens, not px:** sizes are defined in rem so Android's user font-size setting is respected
- **Tokens, not hardcoded values:** these live as Layer 1 CSS variables (`--text-body`, `--control-h`, etc.), overridden under `@media (pointer: coarse)` and `html[lang='bn']`; no component hardcodes a size
- **Touch targets stay 44px** on coarse pointers (section 8c) and compact never shrinks the gap between adjacent tappable elements below 8px
- **Caption/small-text contrast:** use `neutral-600` (not `neutral-500`) for text at 12-13px, since `#737373` is borderline for contrast at small sizes
- Compact applies to the Desktop shell and Mobile shell alike; density is reduced through spacing and type size, never by shrinking touch targets

### Component visual rules
- Touch target minimum (44px on coarse pointers, per section 8c and the Density & Type Scale above) applies to buttons, form inputs, tab bar items; fine pointers (desktop) use the compact 36px control height
- Card-list item style (mobile data display, per section 5), button sizing, and form input style start from shadcn-vue's default components and are customized with the tokens above, rather than built from scratch

## 2b. Internationalization (Bangla + English)

- `vue-i18n`, with locale files at `shared/locales/bn.json` and `shared/locales/en.json` — every UI string goes through a translation key from the start, no hardcoded text (expensive to retrofit later)
- Default locale: Bangla (primary user base is field staff); toggle in settings, preference persisted in `localStorage`
- **Per-term policy, not blanket translation:** technical/scientific terms and units (pH, ppt, °C) stay in English where the English term is clearer than a Bangla equivalent would be; common UI actions (save, edit, delete) are translated to Bangla, except where an English loanword is already standard colloquial usage (e.g. "সেভ", "এডিট") — decided per key, not uniformly
- Zod validation messages are i18n keys (e.g. `validation.ph.out_of_range` + params), never hardcoded Bangla/English text; the UI renders them with `t(key, params)`. The backend returns machine-readable error codes per field (not translated strings), so client-side and server-side errors localize through the same keys
- **Decided:** numeric values and units (pH, salinity readings, etc.) always display in English numerals (0-9), even within Bangla UI text — mobile users are comfortable with English numbers, so no locale-based numeral switching is needed

## 3. Device Strategy: Mobile vs Desktop

**Decision:** two fully separate UI/layouts, not just Tailwind responsive scaling — mobile-native behavior (bottom tab bar, swipe navigation) doesn't translate to desktop.

- Target devices: **Android phones only** (no design effort for iPhone)
- iPhone users assumed to be owners/higher-income, not field staff
- Routes: `www.xxxx.com/m/...` (mobile), `www.xxxx.com/d/...` (desktop)
- Root-level device detection (user-agent + screen width) on first visit; choice persisted in `localStorage`
- Manual toggle in settings (like a browser's "Request Desktop Site")
- Device class selects the shell/layout only; it never grants or removes permissions (RBAC does). Any user may switch shells via the settings toggle; what they can do in either shell is the same permission set
- Deep links (e.g. `/water-quality/123`) shared without a prefix; a guard resolves the correct prefix

### Folder structure

```
src/
  mobile/
    views/
    components/nav/       # BottomTabBar, MoreSheet
    layouts/MobileShell.vue
    router/routes.ts
  desktop/
    views/
    components/nav/       # Sidebar, TopNavbar
    layouts/DesktopShell.vue
    router/routes.ts
  shared/
    api/
    stores/
    storage/               # IndexedDB + sync queue
    composables/
    schemas/                # Zod schemas
    types/
    charts/                  # D3 calculations + Vue render component
  router/index.ts           # root redirect guard
  App.vue
  main.ts
```

**Rule:** `mobile/` and `desktop/` contain no API calls or business logic — everything comes from `shared/`. Zod schemas and chart components are written once and reused by both.

## 4. Navigation (Mobile)

- **No hamburger menu** — sits in a corner, outside the thumb's reach
- **Bottom tab bar** — 4 main modules + "More", always visible (persists across route changes, even inside a module)
- **More sheet** — bottom-to-top sheet (60-70% height), entry point to remaining modules, grouped by category
- Each module has its own sub-navigation (top tabs); content area gets padding-bottom for the bar
- **No back button** — swipe gestures handle navigation (follows browser/app history)
  - Wired to `router.back()` / `router.forward()`
  - Swipe start zone offset 20-30px from the screen edge (avoids Android's system back gesture)
  - Disabled over drag inputs/sliders in forms

## 5. Data Tables

- Mobile: **card-list** (label-value pairs), not a traditional `<table>`
- Desktop: `<table>` is fine (separate layout, no conflict)

## 6. Offline Support (First-class requirement)

### Scope
- **Read and create only** offline — edit/delete only while a record hasn't synced yet (status: pending), since that is purely local data
- Design assumption: a single user can be offline for at most **5 days**
- **Correcting an already-synced record (decided):** online-only, edited directly (no separate correction record, so offline edit conflicts cannot exist). The server is the single source of truth; every edit goes to a server-side audit log (who, when, field, old value, new value); the UI shows an "edited" badge and the change history
- Who may edit is decided by the backend's existing RBAC permission API (e.g. `reading:update`) — the frontend checks permission keys only, never role names, and hiding an edit button in the UI is UX only (the backend enforces). Ownership-scoped rules (own vs any record) are not in the backend yet — see section 10

### Core principles
- Client-generated UUID per record — doubles as the idempotency key
- `recordedAt` (phone clock) vs `syncedAt` (server) kept as separate fields
- Tapping "Save" writes to the phone immediately; sync runs in the background (never block on network)
- Sync status always visible (pending/syncing/failed/synced badge)
- Offline entry screen disabled on iPhone (avoids silent storage eviction risk); detected via user-agent, message shown instead

### Record states
| State | Meaning | Edit/Delete |
|---|---|---|
| pending | waiting to sync | Yes |
| syncing | currently being sent | No |
| failed | rejected by server | user fixes and resubmits |
| synced | reached the server | No offline; online edit only with permission (audited) |

### Late sync policy (decided — replaces the earlier 24-hour delete idea)
- Data is **never deleted** for being old — only flagged
- A reading counts under its `recordedAt` date (the real measurement time), not `syncedAt`: charts and daily/monthly views place a late-synced reading on the day it was measured. Server-side aggregations group by `recordedAt`, and any cached daily aggregate must be invalidated when a late reading arrives
- `isLate = (syncedAt − recordedAt) > 7 days` — deliberately above the 5-day offline assumption so legitimate offline use is not badged (a 24h threshold would flag normal usage); shown as a "late sync" badge
- `needsReview = (syncedAt − recordedAt) > 30 days` — an owner reviews/approves it
- Both thresholds are server config values, not literals
- Alerts/notifications for late-synced readings: deferred to later in development; no schema impact, since the delay is always derivable from `recordedAt` and `syncedAt`

### Clock reliability
- Most Android phones post-2020 auto-sync time, so low risk
- Server-side sanity check: reject `recordedAt` in the future beyond a small tolerance (config, default 5 min); old readings are flagged per the late sync policy above, never rejected

### Single active session (decided)
- One account = one active session (decided: takeover policy). Logging in on a new device revokes the session on the old one; blocking was rejected because an offline device cannot log out and would lock the user out
- The login screen warns when another device holds the session ("logging in here will log you out of the other device")
- A revoked offline device discovers it only when the network returns (refresh fails) → login screen; `pending`/`failed` readings stay in IndexedDB and sync after re-login (same `createdById`)
- Sync-time message must explain: "your session moved to another device, your data is safe"

### Logout behavior
- Field devices are personal phones, so logout only clears auth tokens — it never touches IndexedDB
- `pending`/`failed` readings are kept so they can sync after the next login
- `synced` readings stay in the offline cache under the retention rule below (no privacy risk on a personal device)
- Each reading carries a `createdById` field. The server takes the real creator from the auth token only (never from the payload). If pending readings belong to a different user than the one now logged in, sync pauses and the user is told, so one person's data is never submitted under another's name

### Offline cache retention (decided)
- `pending`/`failed` readings are kept indefinitely, with no time limit
- `synced` readings are cached for the last **30 days** by `recordedAt` (a single config constant, changeable without a schema migration)
- Cleanup runs on app open and after a successful sync; a synced record is removed only if it is confirmed to exist on the server

### Offline session after token expiry (decided)
- The access token lives only in memory, so a cold start offline has no token. The app opens on a non-secret **local session** (`userId` + permission snapshot stored in Dexie)
- Offline, it can only create readings and view cached data — no API calls
- When the network returns: refresh via the httpOnly cookie, then sync pending readings. If refresh fails (expired or revoked), show login; pending data stays untouched in IndexedDB
- Refresh token: 14 days sliding vs the 5-day max offline (section 8)

### First-time setup (decided)
- The first load must be online: the service worker can only be installed and the app shell precached while connected, and the first login needs the network anyway (no token exists yet)
- First-time flow: open link online, log in, service worker precaches the shell, permissions and the last 30 days of data are fetched, then the app shows an "offline ready" state
- Until "offline ready", offline entry is gated with a clear message; once ready, `navigator.storage.persist()` is requested and "Add to Home Screen" is prompted
- A phone that has never loaded the app online cannot show anything offline — the browser's own error page appears and the app cannot change that; this is handled operationally (first open happens with internet, e.g. during onboarding)

## 7. Delivery

- **PWA, distributed via link** — no Play Store plan for now
- If the system succeeds, Capacitor can wrap it into a native APK later (storage layer kept separate so code is reusable)
- HTTPS + domain required (service worker requirement)

### Onboarding plan (demo phase)
- The developer opens the app personally on the first hatchery manager's phone (online) and verifies the "offline ready" state — this doubles as a real pilot before other staff use it
- Other staff get a self-made YouTube tutorial link; the app's own "offline ready" indicator and offline-entry gate are the safety net, since not everyone will follow every step
- Tutorial steps: (1) first open on good internet, ideally Wi-Fi; (2) log in and wait for "offline ready" without closing the app; (3) Add to Home Screen; (4) self-test: turn on airplane mode and open the app; (5) save a first reading and see its "pending" state
- Keep the first-time download small (self-host only the needed Noto Sans Bengali weights/subset; fetch only the last 30 days of data on first setup)

## 8. Security

### Token storage
- **Access token:** in-memory only (Pinia store), never persisted to localStorage/IndexedDB — short-lived, so exposure window is minimal even under XSS
- **Refresh token:** moving from response-body delivery to an **httpOnly cookie**, set by the backend (separate backend task, see below). This is the real fix — no frontend storage trick is as safe as the token never being reachable from JavaScript at all
- Until the backend change lands, refresh token is read from the response body and must NOT be written to localStorage; use Pinia (in-memory) or IndexedDB as an interim measure, understanding neither is immune to XSS the way an httpOnly cookie is
- Backend task tracked separately: move `refresh_token` to `Set-Cookie` (httpOnly, secure, sameSite configurable), update `/auth/refresh` and `/auth/logout` to read from the cookie, add `credentials: true` + explicit CORS origin, add `cookie-parser` middleware
- Refresh token lifetime: 14 days, sliding (renewed on each successful refresh) — comfortably above the 5-day offline assumption
- Rotation keeps a short grace window (~20s, config): a just-rotated token presented again once is accepted instead of treated as theft, because on weak networks the rotation response may never reach the phone; reuse outside the window revokes the token family
- No PIN on the offline local session in the MVP (personal phone with its own lock; the offline session can only create readings); can be added later without a schema change

### XSS prevention
- **Never use `v-html`** anywhere in this app; if a future requirement needs rendering of rich/user-supplied content, sanitize with DOMPurify first — no exceptions
- Vue's `{{ }}` interpolation auto-escapes, so default rendering is safe; the discipline is specifically around `v-html` and any `innerHTML` assignment
- Zod validates shape/type/range — it does **not** sanitize for XSS; validation and sanitization are separate concerns and both apply where relevant
- Treat API responses as untrusted even though they come from our own backend — defense in depth, not an accusation against the backend
- Set a Content-Security-Policy header at the hosting/CDN level restricting script/style sources

## 8a. Error Handling

### Global Vue error handler
- `app.config.errorHandler` in `main.ts` — catches all uncaught errors from component render/lifecycle/watchers across the app; logs to console in dev, will forward to an error-tracking service (e.g. Sentry) once added
- `window.addEventListener('unhandledrejection', ...)` — catches async errors (failed fetches, rejected promises) that the Vue error handler doesn't see
- Both report into a shared `errorStore` so the UI can surface something to the user rather than failing silently

### Fallback UI
- `shared/components/ErrorBoundary.vue` using `onErrorCaptured` — catches errors thrown by descendant components, stops propagation, renders a fallback instead of crashing the whole app
- Wrapped at two levels:
  - **App-level** (in `App.vue`) — last-resort catch-all, shown only if something escapes everywhere else
  - **Per-route-view level** — each module's main view wrapped individually, so a crash in one module doesn't take down the bottom tab bar; the user can still navigate away via the always-visible bar (ties directly into the "bottom bar always visible" navigation decision)
- Fallback messaging must be context-aware, not generic: if a component crashes mid-submit on the water-quality form, the user needs to know whether their reading was saved before the crash — a bare "something went wrong" is not enough when data-loss anxiety is the actual risk
- Retry affordance on the fallback (re-mount the failed subtree) rather than forcing a full page reload where avoidable

## 8c. Accessibility

Given the field-user base, screen-reader usage is unlikely in practice, but most of this is cheap when built in from the start and expensive to retrofit — and the desktop view (owners/admins) benefits from several of these directly.

- **Semantic HTML:** real `<button>` instead of a `<div @click>`, `<label for>` on every form input, `<nav>`/`<ul>` for lists — habit from the start, no real extra cost
- **Touch target size:** minimum 44px, applies to bottom tab bar items, form inputs, and any tappable element — this is also WCAG's minimum, not just a mobile-UX nicety
- **Focus management:** most relevant for `MoreSheet` — focus moves to the first interactive element on open, returns to the trigger button on close (focus trap while open); same rule for any desktop modal/dialog
- **ARIA where needed:** custom components aren't native elements, so they need it explicitly — `BottomTabBar` gets `role="tablist"` + `aria-current` on the active tab, `MoreSheet` gets `role="dialog"` + `aria-modal="true"`, the sync-status badge gets an `aria-label` (status shouldn't be color-only — matters for color-blind users too, not just screen readers)
- **Keyboard navigation:** matters concretely on desktop (Tab through forms, sidebar nav); on mobile it's lower-priority given touch-first use, but focus should never get trapped on an inaccessible element alongside the swipe navigation
- **Screen-reader compatibility:** deprioritized — blind/screen-reader users are practically unlikely in this user base, so the D3 chart's `sr-only` text summary is skipped. ARIA attributes above are kept regardless, since they also back the browser's accessibility tree and `getByRole`-style test selectors, not just screen readers.

## 8b. API Conventions & Resilience

### Pagination/filter/sort convention
- Standard `ListQuery` shape reused across every list-fetching composable: `{ page, limit, sortBy, order, filters }` (default `page: 1`, `limit: 20`, `order: 'desc'`)
- Matches the backend's existing `PaginationQueryDto`/`PaginatedResult` pattern — confirm exact backend field names before wiring `GET /water-quality`, and keep new list endpoints consistent with it

### Timeout
- Default request timeout: 10s (generous, for weak mobile networks) — stricter timeouts cause unnecessary failures on bad connections
- Sync queue background POSTs get a longer timeout (15-20s), since the user isn't actively waiting
- A timeout is treated the same as a network error for sync-queue purposes — the reading stays `pending`, no special-case handling needed

### Retry policy
- **Foreground API calls (GET, dashboard data):** no auto-retry — show an error state with a manual "Retry" action instead; auto-retry on something the user is actively watching just hides delay confusingly
- **Sync queue POSTs:** auto-retry with exponential backoff (mirrors the backend's BullMQ pattern — e.g. `attempts: 3, delay: 2000` doubling), since this runs in the background
  - 4xx (validation errors): treated as permanent failure — goes straight to `failed` status, no retry (retrying won't change a validation rejection); the server's per-field error codes are kept on the record so the user can fix and resubmit
  - 5xx / timeout / network error: transient — gets retried with backoff

## 9. Step-by-Step Implementation Plan

### Step 1: Project Setup
```bash
pnpm create vite@latest hatchery-frontend -- --template vue-ts
pnpm add vue-router pinia zod dexie @vueuse/core vee-validate @vee-validate/zod
pnpm add d3-scale d3-shape d3-array d3-time d3-time-format d3-format
pnpm add -D tailwindcss @tailwindcss/vite vite-plugin-pwa
pnpm add -D @types/d3-scale @types/d3-shape @types/d3-array @types/d3-time @types/d3-time-format @types/d3-format
```
- Configure Tailwind + Vite plugin (mobile-first)
- Init shadcn-vue; add the `form` component via its CLI and check what it installs (verify its docs and the Zod/`@vee-validate/zod` version match first, per section 2)
- `tsconfig.json`: strict mode, `@/*` alias, consistent with the backend boilerplate
- ESLint + Prettier
- `.env` + Zod env validation
- Git init, first commit: `chore: init vue3 + vite + typescript project`

### Step 2: Folder Structure
Set up `mobile/`, `desktop/`, `shared/` as per section 3

### Step 3: PWA Basics
- Configure `vite-plugin-pwa` — manifest, `registerType: 'autoUpdate'`, `display: standalone`
- Precaching + offline fallback page
- Local HTTPS testing via `mkcert`
- "Add to Home Screen" prompt (via `beforeinstallprompt` event)

### Step 4: Navigation Structure
- `BottomTabBar`, `MoreSheet` (mobile)
- `Sidebar`, `TopNavbar` (desktop)
- Device-detection + root redirect guard
- Swipe navigation (VueUse `useSwipe`)

### Step 5: Auth API Integration
- `shared/api/auth.ts`: login, register, refreshToken, logout
- Interceptor: 401 → single in-flight refresh promise (prevents duplicate concurrent refresh calls when multiple sync-queue requests 401 at once)
- Token handling per section 8 (access token in-memory; refresh token moving to httpOnly cookie)
- `useAuth` composable, router guard, `hasPermission()` helper (permission keys from the backend RBAC API, held in Pinia; never role-name checks)
- Local offline session (`userId` + permission snapshot, no secrets) per section 6
- Logout clears tokens only — see section 6
- Handle session-revoked (takeover) on refresh failure: show login with the "session moved to another device" message; never touch IndexedDB

### Step 6: Storage Layer (Dexie)
- `readings` table: `id (uuid)`, `data`, `recordedAt`, `syncedAt`, `status`, `createdById`, `isLate`, `needsReview` (the last two are server-derived flags, default false)
- CRUD functions (edit/delete only while pending)
- `navigator.storage.persist()`
- Retention cleanup (section 6): runs on app open and after a successful sync
- Schema versioning from the first migration (see section 9a) — every structure change bumps Dexie's `version()` with an `upgrade()` step; old `version()` calls are never removed or altered

### Step 7: Sync Engine
- online/offline events + app-open + Background Sync API (Android)
- Idempotent POST (client UUID); records are sent in batches to a batch endpoint with a per-item result, so one failed item never blocks the rest
- Pause sync and notify if pending records' `createdById` differs from the logged-in user
- Status update logic (pending → syncing → synced/failed)
- Retry policy per section 8b: 4xx → `failed` immediately, 5xx/timeout/network → backoff retry

### Step 8: Backend Additions
- `modules/waterQuality/` (controller/service/repository)
- `POST /water-quality`: accepts client UUID, idempotent (same UUID + same user returns the existing record; different user returns 409); plus a batch endpoint with per-item results
- Separate `recordedAt` vs `createdAt`/`syncedAt` columns; `createdById` from the auth token only; future `recordedAt` rejected beyond tolerance; `isLate`/`needsReview` derived server-side; aggregations group by `recordedAt`
- `GET /water-quality`: pagination + date-range filter
- `PATCH /water-quality/:id`: guarded by an RBAC permission (e.g. `waterQuality:update`), writes an audit log
- Permission constants: `waterQuality:*`
- Machine-readable per-field validation error codes (localized on the client)
- Separately: refresh-token-to-cookie migration, 14-day sliding TTL and rotation grace window (see section 8); the full backend task list was drafted as a separate LLM instruction
- Not yet in the backend (later): ownership-scoped permission (own vs any record)

### Step 9: First UI Screens
- Login
- BottomTabBar/MoreSheet or Sidebar/Navbar
- Water quality entry form (shadcn-vue Form + VeeValidate + shared Zod schema, `inputmode="decimal"`)
- Sync-status badge
- Dashboard (D3 line chart)
- `ErrorBoundary` wired at app-level and around each view (see section 8a) before other screens are considered done
- Accessibility basics per section 8c applied as each screen is built (semantic HTML, touch targets, ARIA on custom components), not deferred to a later pass

### Step 10: Verification
- DevTools "Offline" mode testing
- Real Android phone flight-mode testing
- Duplicate-sync prevention check
- Refresh-token race-condition test
- Swipe gesture vs Android system gesture conflict check
- Confirm no `v-html` usage anywhere (lint rule or manual audit)
- 5-day offline scenario: refresh token still valid on return, pending queue syncs in batches
- Late-sync thresholds (`isLate`, `needsReview`) and `recordedAt`-based grouping verified
- Single-session takeover: log in on device B while device A is offline with pending readings; A comes back online → login screen with the right message, pending readings intact and sync after re-login

### Suggested starting order
- Backend (Appendix A): Tasks 1 and 2 first (cookie + refresh TTL/rotation), since frontend auth depends on them; Tasks 3-6 after
- Frontend: Steps 1-4 first (setup, folders, PWA basics, navigation) — these do not depend on the backend
- Commit rhythm: one commit per task/step, conventional format, e.g. `chore: init vue3 + vite + typescript project`, `chore: add tailwind, shadcn-vue and eslint/prettier`, `feat(auth): move refresh token to httpOnly cookie`

## 9a. Dexie Schema Versioning Example

```ts
// shared/storage/db.ts
import Dexie, { type Table } from 'dexie'

interface ReadingV1 {
  id: string
  data: Record<string, number>
  recordedAt: string
  syncedAt: string | null
  status: 'pending' | 'syncing' | 'failed' | 'synced'
  createdById: string
  isLate: boolean // server-derived
  needsReview: boolean // server-derived
}

class HatcheryDB extends Dexie {
  readings!: Table<ReadingV1, string>

  constructor() {
    super('hatchery-db')

    // version 1: initial schema
    this.version(1).stores({
      readings: 'id, status, recordedAt, createdById',
    })

    // example for a future field addition (e.g. species):
    // this.version(2).stores({
    //   readings: 'id, status, recordedAt, createdById, species',
    // }).upgrade(tx => {
    //   return tx.table('readings').toCollection().modify(reading => {
    //     reading.species = 'shrimp' // default for existing records
    //   })
    // })
  }
}

export const db = new HatcheryDB()
```

## 10. Decisions Closed / Still Deferred

### Closed
- Late sync: never delete, flag only; `recordedAt` governs reporting; `isLate` > 7 days, `needsReview` > 30 days (section 6)
- Synced-record correction: online-only direct edit, audit log, RBAC-permission based (section 6)
- Offline cache retention: pending/failed forever, synced 30 days (section 6)
- Offline session after token expiry: local session, 14-day sliding refresh token, 5-day max offline (sections 6 and 8)
- Form library: VeeValidate + Zod via shadcn-vue Form, with the conflict priority in section 2
- First-time setup: requires internet once; "offline ready" gate before offline entry (section 6)
- Single active session per account: takeover policy, not block (section 6)
- Device type is a feature-design lens only; access control is RBAC only (sections 1 and 3)
- Last value on the entry screen: for the selected tank, the current user's own latest reading (local data only, no backend endpoint) pre-fills pH, temperature, salinity and oxygen as an **unconfirmed** value. Each field must be confirmed (tap −/+, type, or tap "same as last") before Save is allowed, so a value can never be saved without an explicit action. A last value older than 24 hours is not pre-filled (shown as a hint only); no previous reading means empty fields. Dexie `readings` needs the index `[createdById+tankId+recordedAt]` at version 1. Step sizes (pH 0.1, temperature 0.5, salinity 1, oxygen 0.1) and the 24-hour limit are samples to confirm with the owner. Known limit: a second device of the same user starts with no history
- Note on a water reading: one optional free-text `note` (max 200 characters), inside the collapsed "more details" section; never required, never blocks Save; shown as a small line on the history card. Always rendered as text (no HTML)
- Units: one fixed unit per parameter (°C, ppt, mg/L), shown as a static label; no unit picker and no unit conversion in the MVP. Reason: one location and one industry use one unit, and conversion adds complexity and wrong-unit risk. Field names carry the unit (`temperatureC`, `salinityPpt`, `oxygenMgL`) so a second unit can be added later without a data migration

### Deferred / backend follow-ups
- Ownership-scoped edit permission (own vs any record) and record creator/owner handling — backend not ready
- Alerts/notifications for late-synced or dangerous readings — to be decided later
- Optional PIN on the offline local session — post-MVP

## Appendix A: Backend change instruction (for the NestJS backend LLM/session)

The codebase was not inspected when this was written, so the first step is to verify what already exists.

~~~text
# Backend changes for the Hatchery offline-first frontend (NestJS)

You are working on an existing NestJS backend (auth, RBAC, BullMQ, health already built).
A Vue 3 offline-first PWA will consume it. Field users are on weak/no network and may
stay offline for up to 5 days, then sync a queue of records.

## Rules of engagement
1. FIRST inspect the codebase and report, for each task below, whether it already
   exists (fully / partially / not at all). Do not re-implement what exists.
2. Show a short plan, then implement ONE task at a time. Show exact diffs for existing
   files. Do not rewrite files wholesale. Do not touch unrelated code.
3. Every behavior below that has a number must be an env/config value, not a literal.
4. Add tests for each task (unit + at least one e2e for endpoints).
5. After each task, suggest a conventional-commit message and stop for review.

## Task 1: Refresh token in httpOnly cookie
- Currently refresh token travels in the request/response body. Move it to an
  httpOnly cookie. Never return the refresh token in the response body.
- Cookie flags from config: Secure, SameSite (Lax if same-site, None if cross-site),
  Path scoped to the auth refresh route, Max-Age = refresh TTL.
- Enable CORS with credentials: true and an explicit origin allow-list (no wildcard).
- Logout clears the cookie. Access token stays in the body (frontend keeps it in memory).

## Task 2: Refresh TTL and rotation with grace window
- Refresh token TTL: 14 days, sliding (each successful refresh issues a new token
  with a fresh 14 days). Configurable.
- Keep rotation, but add a grace window (config, default 20s): if the just-rotated
  token is presented again within the window, accept it once and return the
  current valid session instead of treating it as theft. Reason: on weak networks
  the rotation response may never reach the phone, and the retry must not log the
  user out.
- Reuse outside the grace window = revoke the whole token family.

## Task 2b: Single active session per user
- Track one active refresh-token family per user (session table)
- A new login revokes the user's previous family (takeover, not block), and the old device's next refresh failure returns a distinguishable code (e.g. session_revoked) so the client can show a clear message
- Interacts with Task 2's grace window: grace applies within a family only; a revoked family gets no grace
- Login response/flow should let the client know another session existed, so the login screen can warn beforehand

## Task 3: Idempotent create + batch sync
- Client generates a UUID per reading (the idempotency key). Store it as a unique
  column (or the primary key).
- Creating with a UUID that already exists for the SAME user returns the existing
  record with a success status (no duplicate). Same UUID from a DIFFERENT user = 409.
- Add a batch endpoint accepting an array of records. Process each item
  independently and return a per-item result (created / already_exists / error with
  code). One bad item must never fail the whole batch. Cap batch size (config).

## Task 4: Server-side trust rules for readings
- createdById comes ONLY from the authenticated token, never from the payload.
  Add createdById to the reading entity if missing.
- Accept client recordedAt. Set syncedAt on the server. Never trust client syncedAt.
- Reject recordedAt in the future beyond a small tolerance (config, default 5 min).
- Derive and persist flags: isLate = (syncedAt - recordedAt) > 7 days (config);
  needsReview = (syncedAt - recordedAt) > 30 days (config). Never delete or reject
  a record for being old. Flag only.
- Aggregations (daily/monthly) must group by recordedAt, not by syncedAt/createdAt.

## Task 5: Edit synced records with audit log
- Add a PATCH endpoint for readings, guarded by the EXISTING RBAC permission system
  (a permission key such as reading:update). Do not hardcode role names.
- Every edit writes an audit row: who, when, field, old value, new value.
- Expose an "edited" indicator and the edit history on read.
- Do NOT implement ownership-scoped permission (own vs any record) in this task.
  Only make sure createdById exists so it can be added later. Note it as a follow-up.

## Task 6: Error contract the client depends on
- 4xx = permanent failure (client marks the record failed, no auto-retry).
  5xx / timeouts = retryable. Keep this strictly consistent.
- Validation errors must return machine-readable codes per field
  (e.g. { field: "ph", code: "out_of_range", params: {min, max} }), NOT translated
  strings. The frontend localizes (bn/en) by code.
- List endpoints use one standard shape: { page, limit, sortBy, order, filters },
  matching the existing DTO conventions.

## Out of scope (do not do)
- Ownership-scoped permissions, notification/alert logic for late readings,
  any frontend work.
~~~

Suggested commits: `feat(auth): move refresh token to httpOnly cookie`, `feat(auth): add refresh rotation grace window and 14d sliding ttl`, `feat(readings): add idempotent create and batch sync endpoint`, `feat(readings): derive isLate and needsReview flags from recordedAt`, `feat(readings): add audited patch endpoint for synced records`.