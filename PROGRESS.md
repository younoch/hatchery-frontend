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
| 14 | PWA basics | not started | - |
| 15 | Schema | done | 2026-10-10 |
| 16 | Dexie storage layer | not started | - |
| 17 | Entry screen | not started | - |
| 18 | History and sync badge | not started | - |
| 19 | Error handling | not started | - |
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
## Parking lot
- Switch to single "typescript-eslint" package
- Clean up woff files in dist (keep only woff2)
- Check vue-i18n CSP behavior in the browser console by serving dist with script-src 'self' and no unsafe-eval; now unblocked because the Step 5 placeholder calls t()
- class-variance-authority is in devDependencies but used at runtime; ask owner before moving to dependencies
- Decide whether to add a shadow token for StickyActionBar's rgba(0,0,0,0.12); no shadow token was added in Step 9
- 2026-10-10: vertical slice, only water quality; tab bar from navItems config, More sheet holds desktop switch only; more modules on client feedback.
- Audit still reports min-w-0, h-3.5, w-3.5, mt-0.5 (location unknown, not in ui/*.vue top level) and required-indicator (Field's own <style> class, audit should ignore it)
