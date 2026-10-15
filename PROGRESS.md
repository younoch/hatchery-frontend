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
| 14a | PWA: plugin, manifest, icons, offline fallback | done | 2026-10-13 |
| 14b | PWA: install prompt and offline-ready state | not started | - |  - |
| 14c | PWA: production test on Vercel (real mobile and desktop) | not started | - |
| 15 | Schema | done | 2026-10-10 |
| 16 | Dexie storage layer | done | 2026-10-11 |
| 17a | Entry screen, form and save | done | 2026-10-11 |
| 17b | Entry screen, last value | done | 2026-10-12 |
| 18a | History: sub-tabs and card list | done | 2026-10-12 |
| 18b | History: StatusBadge and pending count | done | 2026-10-12 |
| 18c | History: fix-and-resend (local only) | done | 2026-10-12 |
| 19 | Error handling | not started | done | 2026-10-15 |
| 20 | Auth | not started | - |
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
