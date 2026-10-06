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
| 7 | Field and Input | not started | - |
| 8 | Sheet and Tabs | not started | - |
| 9 | Layout components | not started | - |
| 10 | Styleguide page | not started | - |
| 11 | Mobile shell | not started | - |
| 12 | Desktop shell | not started | - |
| 13 | Swipe navigation | not started | - |
| 14 | PWA basics | not started | - |
| 15 | Schema | not started | - |
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
- 2026-10-03: Zod pinned to 3.25.76 for @vee-validate/zod compatibility (resolved in Step 1).
- 2026-10-04: Bangla and English use the same font sizes; only Bangla line-height differs (1.6).
- 2026-10-04: Removed legacy alias vars --bg/--fg/--line/--focus; code uses shadcn semantic names directly.
- 2026-10-05: One fixed unit per parameter (°C, ppt, mg/L), no unit picker, no conversion. Field names carry the unit (temperatureC, salinityPpt, oxygenMgL).
- 2026-10-05: i18n setup with vue-i18n (legacy: false, default locale: bn, fallback: bn). Language toggle persisted in localStorage, lang attribute kept in sync.
- 2026-10-06: esbuild build script allowed in pnpm-workspace.yaml because vite 8.3.2 resolves tsx/esbuild; revisit when upgrading vite.
- 2026-10-06: Device auto-detection uses the existing 48rem breakpoint; only narrow Android viewports default to mobile.
## Parking lot
- Switch to single "typescript-eslint" package
- Clean up woff files in dist (keep only woff2)
- Check vue-i18n CSP behavior in the browser console by serving dist with script-src 'self' and no unsafe-eval; now unblocked because the Step 5 placeholder calls t()
- class-variance-authority is in devDependencies but used at runtime; ask owner before moving to dependencies
