# Hatchery Software — Frontend Plan

> **Status (2026-10-13):** updated for decisions made during Steps 0-18 (spacing, radius, controls, units, last value, note, tanks, history, sync badge). Section 10 lists closed and deferred items. This document does not depend on any earlier chat history. Appendix A holds the backend change instruction (to give to a backend LLM/session).
>
> **Where files differ:** the live step list is in `AGENTS.md` (section 7) and progress is in `PROGRESS.md`. For visual details (spacing, sizes, layout) the prototype `hatchery-water-entry.html` wins over this plan. For architecture, offline behavior, security and API conventions this plan wins.
>
> **Working notes for the next session:** reply in pure Bangla script (even if the user writes Banglish); backend = trainer-student mode (Socratic, simple-first then industry-level), frontend = industry-standard from the start; for existing files show line-level diffs, do not rewrite whole files unless explicitly asked; suggest commit timing and conventional-commit messages proactively.

## 1. Context

- Backend boilerplate (nestjs-boilerplate) complete — auth, RBAC, password recovery, BullMQ background jobs, health checks all in place
- First species target: **Shrimp**
- First module: **Water Quality** (pH, temperature, salinity, oxygen, optional note). Vertical slice: only this module is built until client feedback
- User profile:
  - ~70% field users (mobile, **personal phones**, not shared devices): internet may be available, slow, or absent — design for all three, offline-first
  - ~30% users may use the same account on two personal devices (phone + desktop/tablet), but **only one active session per account at a time** (see section 6, Single active session)
  - The two device types imply different user demands and mindsets (phone: quick field entry; desktop/tablet: review, management, reporting). This is a **feature-design lens only**, never an access rule — all access control comes from backend RBAC permission keys
- Goal: demo to hatcheries in Cox's Bazar to build trust, then expand features
- **MVP is light mode only.** Android phones are the only mobile target.

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Vue 3 + Vite + TypeScript (strict mode) |
| State | Pinia (installed when first needed, Step 20/22) |
| Validation | **Zod** (pinned to 3.25.76, the peer range of `@vee-validate/zod`) — single source of truth for form shapes, used for form input validation and `.env` validation on both frontend and backend |
| Forms | **VeeValidate v4** with `@vee-validate/zod` (`toTypedSchema`) so the shared Zod schema drives validation and types; fallback if it conflicts with a higher-priority tool: a small custom composable using `schema.safeParse()` |
| CSS | Tailwind 4 (mobile-first), theme defaults wiped (`--*: initial`), tokens only |
| UI components | shadcn-vue style primitives on Reka UI headless components, code lives in the project (not an installed component library), so bundle size stays controlled; Reka UI ships keyboard nav, focus trap and ARIA, covering most of section 8c |
| i18n | vue-i18n 11 (Bangla default, English toggle) |
| Chart | D3 (calculation only — scale/shape/array; Vue template renders the SVG) |
| Offline storage | IndexedDB via Dexie.js, with schema version migrations from day one |
| PWA | vite-plugin-pwa |
| HTTP | fetch/axios wrapper + interceptor |
| Package manager | pnpm |

No test runner is installed (owner decision). No new dependency is added without asking the owner.

**Dropped:** Google Charts (doesn't work offline, CDN-dependent), Nuxt (no SEO/SSR need — the whole app sits behind login).

**Conflict priority (decided):** if tools conflict, the order is shadcn-vue > Tailwind > Zod > VeeValidate, and lower ones are sacrificed first. Zod outranks VeeValidate because the schema is shared with the backend; VeeValidate is only the form-binding layer.

### Zod usage details
- `shared/schemas/waterQuality.schema.ts` — single Zod schema for the water-quality reading shape (`tankId`, `recordedAt`, `ph`, `temperatureC`, `salinityPpt`, `oxygenMgL`, optional `note` up to 200 characters), imported by both mobile and desktop form components. The form schema adds a preprocess step for typed text input
- Validation ranges in the schema (pH 0-14, °C 0-50, ppt 0-60, mg/L 0-20) are **samples** until the owner confirms real values
- Form validation: VeeValidate with `toTypedSchema(schema)`, validated on blur and on submit (not on every keystroke); field-level errors are i18n keys plus params
- `.env` validation: `VITE_API_URL` and other env vars validated at startup, matching the backend's existing Zod env-validation pattern
- API response validation: validate critical API responses against the same schema before writing to IndexedDB, so malformed data never enters local storage

## 2a. Design System Foundation

Perceived product quality in a commercial context depends heavily on UI visual consistency, so a fixed token set is defined up front rather than picking colors ad hoc per screen.

```
Layer 1: Design Tokens (CSS variables, tokens.css)
         primary, success, warning, danger, neutral, spacing, radius, font

Layer 2: Primitive Components (shadcn-vue style + Reka UI)
         Button, Input, Select, Sheet, Tabs, StepperInput — consume tokens via
         semantic Tailwind classes; no hardcoded hex/px values

Layer 3: Composite and layout components (project-specific)
         PageHeader, FormSection, FieldGrid, StickyActionBar, CardList,
         BottomTabBar, MoreSheet, StatusBadge — built from Layer 2 and tokens
```

**Why this framing drives real decisions:**
- Primitives reference CSS variables rather than hardcoded values, so changing the brand palette later means updating the token definitions in one place
- New composite components follow the same variant pattern (`class-variance-authority`/`cva`), so components built at different times stay visually consistent
- A new composite component starts from an existing Layer 2 primitive; a fully custom build only happens when no suitable primitive exists
- Token changes (color, spacing, radius) are made in one place (`tokens.css`), never as a per-component override
- `COMPONENTS.md` is the catalog of shared components; check it before building any UI

### Color palette
Primary is kept hue-distinct from the status colors on purpose, so sync status is never visually confusable with brand color.

```
primary-50:  #ECFEFF
primary-500: #0891B2   ← brand shade (teal/cyan — water + professionalism)
primary-600: #0E7490   ← primary button (white text contrast)
primary-900: #164E63

success (synced):  #16A34A
warning (pending):  #D97706
danger  (failed):   #DC2626

neutral-50:  #FAFAFA
neutral-200: #E5E5E5
neutral-500: #737373
neutral-900: #171717
```

- Primary button uses `primary-600`, not `primary-500`.
- Reading-range colors (ok/warn/bad) and sync-status colors (`sync-pending/syncing/failed/synced`) are **separate tokens**, even where their values match.
- Only these color families are used — no ad hoc new colors added per screen.

### Typography
- Font stack must support Bangla and English in the same element, so a single fallback chain is used rather than switching fonts on language toggle: `['Inter', 'Noto Sans Bengali', 'sans-serif']`
- Fonts are self-hosted (only the needed weights: 400, 500, 600), for the offline-first/fast-load priorities in section 1
- Scale: 2-3 heading levels, body, caption — concrete sizes are in "Density & Type Scale" below

### Spacing and radius
- **Five-step scale only:** 4, 8, 12, 16, 24px (`s-1, s-2, s-3, s-4, s-6`). Tailwind's default spacing is not available.
- **Radius:** control 10px, card 12px, sheet 20px.
- Pages never set their own margins or padding. Layout components own spacing (`PageBody`, `FieldGrid`, `FormSection`, `SectionStack`, `CardList`, `StickyActionBar`). A lint rule blocks margin/padding utilities in view files.

### Density & Type Scale (decided: compact design)
Users work in this system regularly, so the design is **compact** — density serves productivity. Compact must never compromise legibility or touch accuracy.

**Basis is input type, not screen size:** the scale switches on `@media (pointer: coarse)` vs `fine`, not on a "tablet" breakpoint.

| Element | Fine pointer (mouse) | Coarse pointer (touch) |
|---|---|---|
| Body | 14px | 15px |
| Table / card-list text | 13px | 14px |
| Form label | 13px | 14px |
| Caption / badge (minimum) | 12px | 12px |
| Section heading | 16px | 18px |
| Page title | 20px | 20px |
| Input / button height | 36px | 44px |
| Small control (sub-tab, chip, small button) | 32px look | 32px look, 44px touch area |
| Gap between tappable elements | n/a | ≥ 8px |

**Rules:**
- **Bangla and English use the same font sizes** (owner decision, 2026-10-04). Only line-height differs: Bangla 1.6, Latin 1.45, so matra and below-base marks are not clipped. This replaces the earlier "+1px for Bangla" idea.
- **No 11px text anywhere**; 12px is the absolute minimum
- **rem-based tokens, not px:** sizes are defined in rem so Android's user font-size setting is respected
- **Tokens, not hardcoded values:** these live as Layer 1 CSS variables (`--fs-body`, `--control-h`, etc.), overridden under `@media (pointer: coarse)` and `html[lang='bn']`; no component hardcodes a size
- **Touch targets stay 44px** on coarse pointers (section 8c); small controls keep a 44px touch area through invisible padding
- **Caption/small-text contrast:** use the muted foreground token (not a lighter grey) for text at 12-13px
- Compact applies to the Desktop shell and Mobile shell alike; density is reduced through spacing and type size, never by shrinking touch targets

### Component visual rules
- Fields: at most two columns on a phone. Long inputs span the full width. Rarely used fields live in a collapsible "more details" section. The four water fields are single-column stepper fields.
- Primary and cancel buttons are the same size; cancel is a red outline button.
- Card-list item style (mobile data display, per section 5), button sizing, and form input style start from the shared primitives and are customized with the tokens above
- Sync-status badges use color, icon and text together

## 2b. Internationalization (Bangla + English)

- `vue-i18n`, with locale files at `shared/locales/bn.json` and `en.json` — every UI string goes through a translation key from the start, no hardcoded text. View-local locale files (styleguide, heavy screen) are registered in `scripts/check-i18n-keys.ts`
- Default locale: Bangla (primary user base is field staff); toggle in the app bar, preference persisted in `localStorage`, `lang` attribute kept in sync
- **Per-term policy, not blanket translation:** technical/scientific terms and units (pH, ppt, °C) stay in English where the English term is clearer; common UI actions (save, edit, delete) are translated to Bangla, except where an English loanword is already standard colloquial usage (e.g. "সেভ", "এডিট") — decided per key
- Zod validation messages are i18n keys (e.g. `validation.ph.outOfRange` + params), never hardcoded text; the UI renders them with `t(key, params)`. The backend returns machine-readable error codes per field (not translated strings), so client-side and server-side errors localize through the same keys
- **Decided:** numeric values and units always display in English numerals (0-9), even within Bangla UI text. Dates formatted with `Intl.DateTimeFormat` use the `latn` numbering system for the same reason

## 3. Device Strategy: Mobile vs Desktop

**Decision:** two fully separate UI/layouts, not just Tailwind responsive scaling — mobile-native behavior (bottom tab bar, swipe navigation) doesn't translate to desktop.

- Target devices: **Android phones only** (no design effort for iPhone)
- iPhone users assumed to be owners/higher-income, not field staff
- Routes: `/m/...` (mobile), `/d/...` (desktop)
- Root-level device detection on first visit (existing 48rem breakpoint; only narrow Android viewports default to mobile); choice persisted in `localStorage`
- Manual toggle (like a browser's "Request Desktop Site"), currently in the More sheet
- Device class selects the shell/layout only; it never grants or removes permissions (RBAC does)
- Deep links shared without a prefix; a guard resolves the correct prefix
- The dev-only `/dev/styleguide` route exists in dev builds only and must not ship in the production bundle or precache

### Folder structure

```
src/
  mobile/
    views/                  # WaterView (tabs), WaterEntryView, WaterHistoryView, ...
    components/nav/         # MobileAppBar, BottomTabBar, MoreSheet
    layouts/MobileShell.vue
    nav/navItems.ts         # one entry per module in the bottom tab bar
    router/routes.ts
  desktop/
    views/
    components/nav/         # Sidebar, TopNavbar (deferred)
    layouts/DesktopShell.vue
    router/routes.ts
  shared/
    api/
    stores/
    storage/                # Dexie db + readings helpers (+ sync queue later)
    composables/
    schemas/                # Zod schemas
    config/                 # tanks.ts (fixed list for the prototype)
    lib/                    # datetime, utils
    components/             # StatusBadge, Card, Metric, ui/, layout/
    locales/
    types/
    charts/                 # D3 calculations + Vue render component
  router/index.ts           # root redirect guard
  App.vue
  main.ts
```

**Rule:** `mobile/` and `desktop/` contain no API calls or business logic — everything comes from `shared/`. Zod schemas and shared components are written once and reused by both.

## 4. Navigation (Mobile)

- **No hamburger menu** — sits in a corner, outside the thumb's reach
- **Bottom tab bar** — items come from the `navItems` config (one item for now: water), plus a fixed "More" tab, always visible (persists across route changes). Vertical slice: more modules are added on client demand
- **More sheet** — bottom-to-top sheet (about 68% height), holds the desktop-view switch for now; remaining modules later
- Each module has its own sub-navigation (top tabs). The water module has "New entry" and "History" tabs; the entry form stays mounted when switching tabs (`v-show`), so typed values and confirmations are not lost
- App bar: route title, notification bell (sample count, not wired yet), online/offline status chip, language toggle
- **No back button** — swipe gestures handle navigation (deferred, Step 13)
  - Wired to `router.back()` / `router.forward()`
  - Swipe start zone offset 20-30px from the screen edge (avoids Android's system back gesture)
  - Disabled over drag inputs/sliders in forms

## 5. Data Tables

- Mobile: **card-list** (label-value pairs), not a traditional `<table>`. The history card shows time, tank, a sync badge, the four values in a 2x2 grid, and the note as a small text line
- Desktop: `<table>` is fine (separate layout, no conflict)

## 6. Offline Support (First-class requirement)

### Scope
- **Read and create only** offline — edit/delete only while a record hasn't synced yet (status: pending), since that is purely local data
- Design assumption: a single user can be offline for at most **5 days**
- **Correcting an already-synced record (decided):** online-only, edited directly (no separate correction record, so offline edit conflicts cannot exist). The server is the single source of truth; every edit goes to a server-side audit log (who, when, field, old value, new value); the UI shows an "edited" badge and the change history
- Who may edit is decided by the backend's existing RBAC permission API (e.g. `reading:update`) — the frontend checks permission keys only, never role names, and hiding an edit button in the UI is UX only. Ownership-scoped rules (own vs any record) are not in the backend yet — see section 10

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

Current status of the UI (Step 18): the history card shows the badge for each state. "Fix and resend" on a failed record only sets it back to `pending` (local). Editing the rejected values and the real send belong to the sync engine (Step 21). Until then real records are only `pending`; the "pending count" on the History tab counts `pending` and `syncing`, not `failed`.

### Late sync policy (decided — replaces the earlier 24-hour delete idea)
- Data is **never deleted** for being old — only flagged
- A reading counts under its `recordedAt` date (the real measurement time), not `syncedAt`: charts and daily/monthly views place a late-synced reading on the day it was measured. Server-side aggregations group by `recordedAt`, and any cached daily aggregate must be invalidated when a late reading arrives
- `isLate = (syncedAt − recordedAt) > 7 days` — deliberately above the 5-day offline assumption so legitimate offline use is not badged; shown as a "late sync" badge
- `needsReview = (syncedAt − recordedAt) > 30 days` — an owner reviews/approves it
- Both thresholds are server config values, not literals
- Alerts/notifications for late-synced readings: deferred; no schema impact

### Clock reliability
- Most Android phones post-2020 auto-sync time, so low risk
- Server-side sanity check: reject `recordedAt` in the future beyond a small tolerance (config, default 5 min); old readings are flagged per the late sync policy above, never rejected

### Single active session (decided)
- One account = one active session (takeover policy). Logging in on a new device revokes the session on the old one; blocking was rejected because an offline device cannot log out and would lock the user out
- The login screen warns when another device holds the session
- A revoked offline device discovers it only when the network returns (refresh fails) → login screen; `pending`/`failed` readings stay in IndexedDB and sync after re-login (same `createdById`)
- Sync-time message must explain: "your session moved to another device, your data is safe"

### Logout behavior
- Field devices are personal phones, so logout only clears auth tokens — it never touches IndexedDB
- `pending`/`failed` readings are kept so they can sync after the next login
- `synced` readings stay in the offline cache under the retention rule below
- Each reading carries a `createdById` field. The server takes the real creator from the auth token only. If pending readings belong to a different user than the one now logged in, sync pauses and the user is told. Until Step 20 a stub user id is used

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
- The first load must be online: the service worker can only be installed and the app shell precached while connected, and the first login needs the network anyway
- First-time flow: open link online, log in, service worker precaches the shell, permissions and the last 30 days of data are fetched, then the app shows an "offline ready" state
- Until "offline ready", offline entry is gated with a clear message; once ready, `navigator.storage.persist()` is requested and "Add to Home Screen" is prompted
- A phone that has never loaded the app online cannot show anything offline; this is handled operationally (first open happens with internet, e.g. during onboarding)

## 7. Delivery

- **PWA, distributed via link** — no Play Store plan for now
- If the system succeeds, Capacitor can wrap it into a native APK later (storage layer kept separate so code is reusable)
- HTTPS + domain required (service worker requirement)

### Onboarding plan (demo phase)
- The developer opens the app personally on the first hatchery manager's phone (online) and verifies the "offline ready" state — this doubles as a real pilot before other staff use it
- Other staff get a self-made YouTube tutorial link; the app's own "offline ready" indicator and offline-entry gate are the safety net
- Tutorial steps: (1) first open on good internet, ideally Wi-Fi; (2) log in and wait for "offline ready" without closing the app; (3) Add to Home Screen; (4) self-test: turn on airplane mode and open the app; (5) save a first reading and see its "pending" state
- Keep the first-time download small (self-host only the needed font weights/subsets; fetch only the last 30 days of data on first setup; lazy route imports keep the main chunk small)

## 8. Security

### Token storage
- **Access token:** in-memory only (Pinia store), never persisted to localStorage/IndexedDB
- **Refresh token:** moving from response-body delivery to an **httpOnly cookie**, set by the backend (separate backend task, see Appendix A)
- Until the backend change lands, refresh token is read from the response body and must NOT be written to localStorage; use Pinia (in-memory) as an interim measure
- Refresh token lifetime: 14 days, sliding — comfortably above the 5-day offline assumption
- Rotation keeps a short grace window (~20s, config): a just-rotated token presented again once is accepted instead of treated as theft; reuse outside the window revokes the token family
- No PIN on the offline local session in the MVP; can be added later without a schema change

### XSS prevention
- **Never use `v-html`** anywhere in this app, and no `innerHTML` assignment; if a future requirement needs rich content, sanitize with DOMPurify first — no exceptions
- Vue's `{{ }}` interpolation auto-escapes, so default rendering is safe. User text such as the reading `note` is always rendered as text
- Zod validates shape/type/range — it does **not** sanitize for XSS
- Treat API responses as untrusted even though they come from our own backend
- Set a Content-Security-Policy header at the hosting/CDN level restricting script/style sources. Check vue-i18n behavior under a strict CSP (no `unsafe-eval`) during the PWA step

## 8a. Error Handling

### Global Vue error handler
- `app.config.errorHandler` in `main.ts` — catches uncaught errors from component render/lifecycle/watchers; logs to console in dev, will forward to an error-tracking service once added
- `window.addEventListener('unhandledrejection', ...)` — catches async errors the Vue error handler doesn't see
- Both report into a shared `errorStore` so the UI can surface something to the user rather than failing silently
- Dexie `liveQuery` subscriptions need an error callback (history list and pending count); handled in this step

### Fallback UI
- `shared/components/ErrorBoundary.vue` using `onErrorCaptured` — catches errors thrown by descendant components, renders a fallback instead of crashing the whole app
- Wrapped at two levels:
  - **App-level** (in `App.vue`) — last-resort catch-all
  - **Per-route-view level** — each module's main view wrapped individually, so a crash in one module doesn't take down the bottom tab bar
- Fallback messaging must be context-aware: if a component crashes mid-submit on the water-quality form, the user needs to know whether their reading was saved before the crash
- Retry affordance on the fallback (re-mount the failed subtree) rather than forcing a full page reload where avoidable

## 8c. Accessibility

Screen-reader usage is unlikely in this user base, but most of this is cheap when built in from the start and expensive to retrofit.

- **Semantic HTML:** real `<button>` instead of a `<div @click>`, `<label for>` on every form input, `<nav>`/`<ul>` for lists
- **Touch target size:** minimum 44px for tab bar items, form inputs, and any tappable element (small controls use invisible padding)
- **Focus management:** sheets move focus in on open, return it to the trigger on close, and trap focus while open
- **ARIA where needed:** custom components aren't native elements, so they need it explicitly — the bottom nav uses `aria-current` on the active item, sheets use `role="dialog"` + `aria-modal="true"`, the stepper input uses `role="spinbutton"`. The sync-status badge shows **color, icon and text together**, so it never relies on color alone; it needs no separate `aria-label` because its visible text states the status
- **Keyboard navigation:** matters concretely on desktop; on mobile it is lower-priority, but focus should never get trapped
- **Screen-reader compatibility:** deprioritized (e.g. no `sr-only` summary for the D3 chart). ARIA attributes above are kept regardless

## 8b. API Conventions & Resilience

### Pagination/filter/sort convention
- Standard `ListQuery` shape reused across every list-fetching composable: `{ page, limit, sortBy, order, filters }` (default `page: 1`, `limit: 20`, `order: 'desc'`)
- Matches the backend's existing `PaginationQueryDto`/`PaginatedResult` pattern — confirm exact backend field names before wiring `GET /water-quality`

### Timeout
- Default request timeout: 10s (generous, for weak mobile networks)
- Sync queue background POSTs get a longer timeout (15-20s)
- A timeout is treated the same as a network error for sync-queue purposes — the reading stays `pending`

### Retry policy
- **Foreground API calls (GET, dashboard data):** no auto-retry — show an error state with a manual "Retry" action instead
- **Sync queue POSTs:** auto-retry with exponential backoff (e.g. `attempts: 3, delay: 2000` doubling)
  - 4xx (validation errors): permanent failure — goes straight to `failed`, no retry; the server's per-field error codes are kept on the record so the user can fix and resubmit (this needs a `version(2)` Dexie change to store the error codes)
  - 5xx / timeout / network error: transient — retried with backoff

## 9. Step-by-Step Implementation Plan

> **Superseded:** the live step list is in `AGENTS.md` (section 7), and progress is in `PROGRESS.md`. The outline below is the original plan and is kept for reference only. Step numbers here do not match the live list.

### Step 1: Project Setup
```bash
pnpm create vite@latest hatchery-frontend -- --template vue-ts
pnpm add vue-router pinia zod dexie @vueuse/core vee-validate @vee-validate/zod
pnpm add d3-scale d3-shape d3-array d3-time d3-time-format d3-format
pnpm add -D tailwindcss @tailwindcss/vite vite-plugin-pwa
pnpm add -D @types/d3-scale @types/d3-shape @types/d3-array @types/d3-time @types/d3-time-format @types/d3-format
```
(In the live project, packages are installed in the step that first uses them.)
- Configure Tailwind + Vite plugin (mobile-first)
- Init shadcn-vue; verify the Zod/`@vee-validate/zod` version match first
- `tsconfig.json`: strict mode, `@/*` alias
- ESLint + Prettier
- `.env` + Zod env validation

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
- Interceptor: 401 → single in-flight refresh promise
- Token handling per section 8
- `useAuth` composable, router guard, `hasPermission()` helper (permission keys held in Pinia; never role-name checks)
- Local offline session (`userId` + permission snapshot, no secrets) per section 6
- Logout clears tokens only
- Handle session-revoked (takeover) on refresh failure; never touch IndexedDB

### Step 6: Storage Layer (Dexie)
- `readings` table, CRUD functions (edit/delete only while pending)
- `navigator.storage.persist()`
- Retention cleanup (section 6)
- Schema versioning from the first migration (section 9a)

### Step 7: Sync Engine
- online/offline events + app-open + Background Sync API (Android)
- Idempotent POST (client UUID); batches with per-item results
- Pause sync and notify if pending records' `createdById` differs from the logged-in user
- Status update logic (pending → syncing → synced/failed)
- Retry policy per section 8b

### Step 8: Backend Additions
- See Appendix A (done in the separate backend project)

### Step 9: First UI Screens
- Login, navigation, water quality entry form, sync-status badge, dashboard (D3 line chart)
- `ErrorBoundary` wired at app-level and around each view
- Accessibility basics per section 8c applied as each screen is built

### Step 10: Verification
- DevTools "Offline" mode testing
- Real Android phone flight-mode testing
- Duplicate-sync prevention check
- Refresh-token race-condition test
- Swipe gesture vs Android system gesture conflict check
- Confirm no `v-html` usage anywhere
- 5-day offline scenario: refresh token still valid on return, pending queue syncs in batches
- Late-sync thresholds and `recordedAt`-based grouping verified
- Single-session takeover scenario

## 9a. Dexie Schema (current, version 1)

```ts
// shared/storage/db.ts
import Dexie, { type Table } from 'dexie'

export type SyncStatus = 'pending' | 'syncing' | 'failed' | 'synced'

export interface Reading {
  id: string // client UUID, also the idempotency key
  tankId: string // fixed tank key for now
  ph: number
  temperatureC: number
  salinityPpt: number
  oxygenMgL: number
  note?: string
  recordedAt: string // ISO, phone clock
  syncedAt: string | null // server time, never set by the client
  status: SyncStatus
  createdById: string
  isLate: boolean // server-derived
  needsReview: boolean // server-derived
}

class HatcheryDB extends Dexie {
  readings!: Table<Reading, string>

  constructor() {
    super('hatchery-db')

    // version 1: initial schema. Never edit or remove this call; add version(2) for changes.
    this.version(1).stores({
      readings: 'id, status, recordedAt, createdById, [createdById+tankId+recordedAt]',
    })

    // example for a future change (e.g. server error codes on failed records, or a tanks table):
    // this.version(2).stores({
    //   readings: 'id, status, recordedAt, createdById, [createdById+tankId+recordedAt]',
    //   tanks: 'id',
    // }).upgrade(tx => {
    //   return tx.table('readings').toCollection().modify(reading => {
    //     reading.errorCodes = reading.errorCodes ?? []
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
- Form library: VeeValidate + Zod, with the conflict priority in section 2
- First-time setup: requires internet once; "offline ready" gate before offline entry (section 6)
- Single active session per account: takeover policy, not block (section 6)
- Device type is a feature-design lens only; access control is RBAC only (sections 1 and 3)
- Last value on the entry screen: for the selected tank, the current user's own latest reading (local data only, no backend endpoint) pre-fills pH, temperature, salinity and oxygen as an **unconfirmed** value (muted italic). Each field must be confirmed (tap −/+, type, or tap the "same as last" chip) before Save is allowed, so a value can never be saved without an explicit action. The chip puts the last value back and confirms it. There is no age limit on the last value (owner decision, 2026-10-13); no previous reading means empty fields. Changing the tank reloads the values. Dexie `readings` has the index `[createdById+tankId+recordedAt]` at version 1. **Step sizes (pH 0.1, temperature 0.5, salinity 1, oxygen 0.1) are confirmed by the owner (2026-10-13).** Known limit: a second device of the same user starts with no history
- Note on a water reading: one optional free-text `note` (max 200 characters), inside the collapsed "more details" section; never required, never blocks Save; shown as a small line on the history card. Always rendered as text (no HTML)
- Units: one fixed unit per parameter (°C, ppt, mg/L), shown as a static label; no unit picker and no unit conversion in the MVP. Field names carry the unit (`temperatureC`, `salinityPpt`, `oxygenMgL`) so a second unit can be added later without a data migration
- Spacing is a five-step scale and radius has three values (section 2a); Bangla and English share font sizes (section 2a)
- Water module history: sub-tabs "New entry" and "History"; the entry form stays mounted when switching tabs (`v-show`) so typed values are not lost
- Fix-and-resend on a failed record is local-only until the sync engine (Step 21): it sets the record back to `pending`
- Formatting is not an ESLint error; Prettier is run by hand on specific files (running it on `src/mobile` rewrites view JSON files)

### Deferred / backend follow-ups
- Ownership-scoped edit permission (own vs any record) and record creator/owner handling — backend not ready
- Alerts/notifications for late-synced or dangerous readings — which events notify is still undecided
- Optional PIN on the offline local session — post-MVP
- Tank list: fixed config for the prototype; organization-scoped, backend-driven tanks (and an organization module) after client feedback. Adding `tanks` to Dexie then needs `version(2)`; existing readings stay untouched
- Notifications sheet, desktop shell, swipe navigation: deferred until client feedback
- Batch screen: blocked until the owner gives the real field list
- Real validation ranges and "danger" values for the four parameters: the owner must confirm by production practice

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