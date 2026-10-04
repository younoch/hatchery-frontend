# Progress

| Step | Name | Status | Approved on |
|---|---|---|---|
| 0 | Orientation | done | 2026-10-03 |
| 1 | Project setup | done | 2026-10-03 |
| 2 | Tailwind and shadcn-vue init | done | 2026-10-03 |
| 3 | Design tokens (Layer 1) | done | 2026-10-04 |
| 4 | i18n | not started | - |
| 5 | Folder structure and routing | not started | - |
| 6 | Button | not started | - |
| 7 | Field, Input and unit picker | not started | - |
| 8 | Sheet and Tabs | not started | - |
| 9 | Layout components | not started | - |
| 10 | Styleguide page | not started | - |
| 11 | Mobile shell | not started | - |
| 12 | Desktop shell | not started | - |
| 13 | Swipe navigation | not started | - |
| 14 | PWA basics | not started | - |
| 15 | Schema and units | not started | - |
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

## Parking lot
- Move components.json and src/lib/utils.ts to shared/ in Step 5
- Switch to single "typescript-eslint" package
- Clean up woff files in dist (keep only woff2)
- Removed legacy alias vars --bg/--fg/--line/--focus from :root (now use shadcn semantic names directly)
