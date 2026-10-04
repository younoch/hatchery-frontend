# AGENTS.md: Hatchery Frontend

You are building the frontend of a hatchery management app, one small step at a time, with the owner reviewing after every step. This file says **how to work**. What to build is in the two reference files below.

## 1. Read these first (in this order)

1. `hatchery-frontend-plan-en.md`: the plan. Architecture, offline behavior, security, API conventions, decisions already closed. Do not reopen closed decisions.
2. `hatchery-water-entry.html`: a clickable **visual prototype**. Open it in a browser and use it (tap "আরও", then "ব্যাচ"; toggle offline; switch language; open the bell). It is a design reference, not production code. Copy its decisions (tokens, spacing, sizes, layout, behavior), never its code.
3. `PROGRESS.md`: created by you in Step 0. Read it at the start of every session to know where you are.

### Which file wins
- Architecture, data flow, offline, security, API: **the plan**.
- Visual decisions (spacing, radius, control sizes, layout components, screen composition, type scale): **the prototype**, where it differs from the plan.
- Anything in neither file: **ask the owner**. Do not invent.

### Decided after the plan was written (prototype wins, plan not yet updated)
- Spacing is a five-step scale only: 4, 8, 12, 16, 24px (`s-1, s-2, s-3, s-4, s-6`). The plan's line "Tailwind default spacing as-is" is outdated.
- Radius: control 10px, card 12px, sheet 20px.
- Controls: field, primary button and cancel button are 44px on touch (36px with a mouse). Sub-tabs, chips and small inline buttons look 32px but keep a 44px touch area through invisible padding.
- Primary button uses `primary-600`, not `primary-500` (white text contrast). Cancel button is a red outline button, same size as Save.
- Fields: at most two columns on a phone. Long inputs span the full width. Rarely used fields live in a collapsible "more details" section.
- Unit picker on temperature (°C/°F), salinity (ppt/ppm), oxygen (mg/L/ppm). Typed values convert when the unit changes. Stored data is always °C, ppt, mg/L.
- Notification bell with an unread count in the app bar on every screen; the list opens in the same bottom-sheet pattern as the More sheet.
- Bangla and English use the SAME font sizes (owner decision, changed after the prototype; the prototype's Bangla +1px override is outdated). Only line-height differs: Bangla 1.6.
- Sync-status badges use color, icon and text together.
- The validation ranges shown in the prototype are samples. Do not hardcode them as real limits; confirm with the owner.
- **Proposed, confirm with the owner at Step 3:** reading-range colors (ok/warn/bad) are separate tokens from the sync-status colors; MVP is light mode only.

## 2. How to work with the owner

- The owner has about 6 years of frontend experience. Write industry-standard code from the start. Do not simplify first and refine later.
- **Talk to the owner in English only**, even if he writes Banglish. Keep replies short and plain (the owner wants low token usage). Code, identifiers, comments, commit messages and file names are in English too.
- Be direct and honest. If the plan or the prototype has a problem, say so with the reason; do not follow it silently.
- For an existing file, show the exact line-level change (a diff). Do not rewrite a whole file unless asked. A new file is shown in full.
- Do not run `git commit` or `git push` unless the owner asks. Propose the commit time and a conventional-commit message at every checkpoint.
- Ask at most one question at a time, and only when blocked. Otherwise take the conventional option and report the choice at the checkpoint.
- The backend is a separate project. Do not touch it. Backend tasks are in Appendix A of the plan.

## 3. The step loop (follow exactly)

For every step in section 7:

1. **Announce** the step in one line.
2. **Do only that step.** Smallest working increment. Do not start work that belongs to a later step. No refactors outside the step; note them in the "Parking lot" of `PROGRESS.md` instead.
3. **Verify:** run `pnpm lint`, `pnpm typecheck` and `pnpm build`, plus tests if the project has them. Report the real results, including failures.
4. **Checkpoint:** stop and post the report in section 4. Then **wait**. Do not continue on your own.
5. **Owner review.**
   - If the owner gives suggestions: implement **only those**, verify again, post a short checkpoint update, and wait again. Repeat until there are none.
   - If the owner says there is nothing to change ("ok", "next", "no suggestions" or similar): mark the step done in `PROGRESS.md` and start the next step.
6. Never skip ahead, never batch steps, never mark a step done without the owner's explicit message. Silence is not approval.

## 4. Checkpoint report (English, keep it short)

```
Step N: <name>: ready for review
- What changed: <short, plain>
- Files: <created / modified>
- How to check it by hand: <exact commands or clicks>
- Verification: lint / typecheck / build / tests: <real results>
- Compared with the prototype: <what matches, what differs and why>   (UI steps only)
- Choices I made: <anything not dictated by the plan>
- Problems or doubts: <or "none">
- Proposed commit: <type(scope): message>
```

## 5. Hard rules (never break; if one blocks you, ask)

**Stack (fixed):** Vue 3 + Vite + TypeScript (strict), Pinia, Zod, VeeValidate v4 through shadcn-vue's Form with `@vee-validate/zod`, Tailwind, shadcn-vue (Reka UI), vue-i18n, Dexie, vite-plugin-pwa, D3 for calculation only, pnpm. On conflict the priority is shadcn-vue > Tailwind > Zod > VeeValidate. Add no new dependency without asking.

**Code:**
- Never use `v-html` or assign `innerHTML`.
- No hardcoded UI text. Every string is an i18n key (`bn` default, `en`). Validation messages are keys plus params.
- No hardcoded colors, px sizes or spacing in components. Use tokens and the layout components. Pages do not set their own margins or padding.
- Spacing only from the five-step scale; radius only from the three values above; no 11px text; sizes in rem.
- Check permissions by permission key, never by role name. Hiding a button is UX only.
- `mobile/` and `desktop/` contain no API calls and no business logic. All of that lives in `shared/`.
- Access token only in memory. Never write any token to localStorage.
- Numbers and units display in English numerals and English unit symbols, even in Bangla text.
- Stored readings use base units (°C, ppt, mg/L). Display and input units are a preference.
- Android phones are the only mobile target. Light mode only for the MVP.

**Offline:** follow section 6 of the plan exactly (client UUID, `recordedAt` vs `syncedAt`, never delete data for being old, logout never touches IndexedDB, Dexie versioning from version 1).

## 6. Definition of done (every step)

- `pnpm lint`, `pnpm typecheck`, `pnpm build` all pass.
- No hardcoded text, colors or spacing introduced.
- UI works at 360px width, in Bangla and in English.
- Touch targets and gaps follow section 1 of this file.
- Accessibility basics from section 8c of the plan (semantic HTML, labels, focus handling, ARIA on custom components).
- UI steps: compared side by side with the prototype and the differences listed.

## 7. Steps

Each step ends at a checkpoint (section 3). Steps are deliberately small. If one turns out too big, split it and tell the owner.

**Phase A: Foundation**
- **Step 0: Orientation.** The owner has already created the Vue project (Vite + `vue-ts`, pnpm); do not scaffold it again. Read both reference files. Report what you understood, any conflict or gap you found, what the existing project contains, and the versions of Node and pnpm. Check the current shadcn-vue Form docs and Zod / `@vee-validate/zod` version compatibility. Create `PROGRESS.md` (step list with status, decisions log, parking lot). No code.
- **Step 1: Project setup.** Verify the existing Vite `vue-ts` project (do not re-create it). Then add: strict `tsconfig` with `@/*` alias, ESLint + Prettier, `.env` with Zod validation, and `lint` / `typecheck` scripts. Install only the packages this step needs; the other packages from the plan are installed in the step that first uses them. Done when `lint`, `typecheck` and `build` pass.
- **Step 2: Tailwind and shadcn-vue init.** Tailwind with the Vite plugin, shadcn-vue init. No components yet beyond what init creates.
- **Step 3: Design tokens (Layer 1).** Light palette, five-step spacing, three radii, rem type scale with the Bangla override, control sizes with the touch override, self-hosted Inter and Noto Sans Bengali (only the needed weights). Map to Tailwind. Replace shadcn-vue's hardcoded `h-9` / `text-sm` with tokens. Confirm the two "proposed" decisions in section 1 with the owner.
- **Step 4: i18n.** vue-i18n, `shared/locales/bn.json` and `en.json`, language toggle persisted in `localStorage`, `lang` attribute kept in sync.
- **Step 5: Folder structure and routing.** `mobile/`, `desktop/`, `shared/`, root router, device detection with a manual toggle, placeholder views only.

**Phase B: Components**
- **Step 6: Button.** Variants: primary, red-outline cancel, small (32px look, 44px touch area). Built with `cva`.
- **Step 7: Field, Input and unit picker.** Form field wrapper (label, control, error), numeric input with unit slot, native-select unit picker, Select.
- **Step 8: Sheet and Tabs.** Bottom Sheet with focus trap, Esc, scrim, and focus returning to the trigger; sub-tabs with the small-control touch area.
- **Step 9: Layout components.** `PageHeader`, `FormSection` (collapsible), `FieldGrid`, `StickyActionBar`, `CardList`. They own all spacing. Add a lint or review rule that view files do not use margin or padding utilities.
- **Step 10: Styleguide page.** `/dev/styleguide` showing every component in Bangla and English. Include one heavy screen (about 14 fields in sections) as a stress test.

**Phase C: Shells**
- **Step 11: Mobile shell.** App bar (bell with unread count, online chip, language), `BottomTabBar`, `MoreSheet`, notifications sheet (sample data), with the ARIA and focus rules from the plan.
- **Step 12: Desktop shell.** `Sidebar` and `TopNavbar`, minimal.
- **Step 13: Swipe navigation.** VueUse `useSwipe`, 20-30px edge offset, disabled over drag inputs.
- **Step 14: PWA basics.** `vite-plugin-pwa`, manifest, offline fallback page, `mkcert` HTTPS, install prompt, "offline ready" state.

**Phase D: Water quality (mobile first)**
- **Step 15: Schema and units.** Shared Zod schema for a reading, unit conversion helpers (base units), i18n error keys. If you want a test runner for the conversion logic, ask the owner first.
- **Step 16: Dexie storage layer.** `readings` table at version 1, CRUD (edit and delete only while pending), `navigator.storage.persist()`, retention cleanup. Use a stub user id until Step 20.
- **Step 17: Entry screen.** Build the prototype's entry screen with VeeValidate + Zod: units, save to Dexie as `pending`, cancel, status line.
- **Step 18: History and sync badge.** Card list, status badge (pending, syncing, failed, synced), fix-and-resend on a failed record.
- **Step 19: Error handling.** Global Vue error handler, `unhandledrejection`, `ErrorBoundary` at app and view level with context-aware messages.

**Phase E: Backend integration (ask the owner whether the backend tasks are ready; if not, build against a mock adapter and say so)**
- **Step 20: Auth.** Login, refresh interceptor with a single in-flight refresh, in-memory access token, permission keys in Pinia, local offline session, session-revoked handling.
- **Step 21: Sync engine.** Batch idempotent sync, retry policy from section 8b, pause when `createdById` differs from the logged-in user.
- **Step 22: Notifications.** Replace sample data with real events. Which events notify is still undecided in the plan, so ask first.

**Phase F: Remaining screens and verification**
- **Step 23: Dashboard.** D3 line chart grouped by `recordedAt`.
- **Step 24: Desktop views.** Water quality entry and list (table) in the desktop shell.
- **Step 25: Batch screen.** Only after the owner gives the real field list. The prototype's batch screen uses invented fields.
- **Step 26: Verification pass.** The checklist in section 9, Step 10 of the plan, plus the single-session takeover scenario.

## 8. PROGRESS.md format

```
# Progress
| Step | Name | Status | Approved on |
|---|---|---|---|
| 0 | Orientation | done / in review / not started | YYYY-MM-DD |

## Decisions log
- YYYY-MM-DD: <decision and why>

## Parking lot
- <things noticed but out of scope for the current step>
```

Update it at every checkpoint. A status is `done` only after the owner approves.