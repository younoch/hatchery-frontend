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
- One fixed unit per parameter: temperature °C, salinity ppt, oxygen mg/L, shown as a static label. No unit picker and no unit conversion in the MVP (owner decision; the prototype's picker was removed). Field names carry the unit (`temperatureC`, `salinityPpt`, `oxygenMgL`).
- Last value and steppers (see the plan, section 10): the four water fields are single-column stepper fields (−, value, +, 44px buttons, long-press repeat; typing still works). The current user's own latest reading for the selected tank pre-fills them as an **unconfirmed** value (muted italic) with a "same as last" chip; each field must be confirmed before Save works. Older than 24 hours: hint only, no pre-fill. Step sizes and the 24 h limit are samples; confirm with the owner.
- Optional `note` on a water reading: max 200 characters, in the collapsed "more details" section, never required, shown as a small line on the history card, always rendered as text.
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
5. **Shared components:** if the step creates or changes a shared component, update COMPONENTS.md in the same step.
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
- Reused / extracted: <shared components reused, new ones created, any UI duplicated and why>
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
- Readings are stored and shown in °C, ppt, mg/L only. Do not build unit conversion.
- Android phones are the only mobile target. Light mode only for the MVP.
- Reuse rule: before building any UI, check COMPONENTS.md and shared/components/. If the same pattern (same markup and behavior, differing only in text, data or variant) is needed a second time, do not copy it: extract it into shared/components/ (shadcn primitives stay in shared/components/ui/). Text, data and variants come in through props, slots and cva variants, never hardcoded inside. The first use may stay inline, except for these patterns which are shared from the start: Metric (label, value, unit), StatusBadge, Card, SummaryCard.

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
- **Step 7: Field and Input.** Form field wrapper (label, control, error), numeric input with a static unit label, numeric stepper input (−/+, long-press repeat, 44px buttons), Select.
- **Step 8: Sheet and Tabs.** Bottom Sheet with focus trap, Esc, scrim, and focus returning to the trigger; sub-tabs with the small-control touch area.
- **Step 9: Layout components.** `PageHeader`, `FormSection` (collapsible), `FieldGrid`, `StickyActionBar`, `CardList`. They own all spacing. Add a lint or review rule that view files do not use margin or padding utilities.
- **Step 10a: Styleguide, components only.** `/dev/styleguide` (dev builds only, `import.meta.env.DEV`; must not ship in the production bundle or precache). Show every existing shared component with its variants and states, in Bangla and English, using the single existing language switch. The page is a view file, so the no-view-spacing-utils rule applies: spacing only through layout components. Extend `scripts/check-layout-classes.mjs` to scan all `.css` files in `dist/assets` and also `src/**/views/**/*.vue`.
- **Step 10b: Styleguide, heavy screen.** One stress-test screen (about 14 fields in sections) added to the styleguide, 360px in bn and en.

**Phase C: Shells**
- **Step 11a: Mobile shell, app bar.** `MobileShell` structure (app bar, scrolling content area, offline banner) and the app bar
- **Step 11b: Mobile shell, tab bar.** `BottomTabBar` (items from a `navItems` config, one for now, plus a fixed "More" tab, `aria-current`, 56px items) and `MoreSheet` (opens above the tab bar, desktop-view switch only), built on the existing `Sheet`. Vertical slice: more modules are added on client demand.
- **Step 11c: Mobile shell, notifications.** Notifications sheet (sample data, bell opens it, mark-all-read), and fix the `Sheet` height so it is relative to the app container, not the viewport. Scrim becomes `bg-foreground/50`.
- **Step 12: Desktop shell.** `Sidebar` and `TopNavbar`, minimal.
- **Step 13: Swipe navigation.** VueUse `useSwipe`, 20-30px edge offset, disabled over drag inputs.
- **Step 14-pre: Lazy route imports.** Convert route components to dynamic `import()` so the main chunk shrinks. No other change.
- **Step 14a: PWA, plugin and manifest.** `vite-plugin-pwa` (ask before installing), manifest, icons, precache, offline fallback page. The dev styleguide must not ship in the precache.
- **Step 14b: PWA, HTTPS and install.** `mkcert` HTTPS for local testing, `beforeinstallprompt` install prompt, "offline ready" state.
- **Step 14c: PWA, real Android test.** The owner runs a checklist on a real phone (airplane mode, install, save a reading offline).

**Phase D: Water quality (mobile first)**
- **Step 15: Schema.** Shared Zod schema for a reading (fields named `temperatureC`, `salinityPpt`, `oxygenMgL`, plus optional `note` up to 200 characters; validation ranges still to be confirmed with the owner), i18n error keys. No unit conversion. If you want a test runner for the schema, ask the owner first.
- **Step 16: Dexie storage layer.** `readings` table at version 1 with the index `[createdById+tankId+recordedAt]` and a helper for "latest reading of this user for this tank", CRUD (edit and delete only while pending), `navigator.storage.persist()`, retention cleanup. Use a stub user id until Step 20.
- **Step 17a: Entry screen, form and save.** Prototype's entry screen at `/m/water` with VeeValidate + Zod: recorded-at, tank Select (from `src/shared/config/tanks.ts`), four `StepperInput` fields with static unit labels, collapsed "more details" (note), `StickyActionBar` (cancel, save), validate on blur and submit, save to Dexie as `pending`, cancel clears the form, status line. No last-value prefill yet; Save works once all four values are valid.
- **Step 17b: Entry screen, last value.** Last-value pre-fill for the selected tank (the current user's own latest reading, local Dexie data): unconfirmed muted-italic value, "same as last" chip, each of the four fields must be confirmed before Save, no pre-fill when older than 24 hours (hint only).
- **Step 18a: History, sub-tabs and card list.** "New entry" and "History" sub-tabs on `/m/water` (using `Tabs`), card list from local Dexie data (`listReadings`), no badge yet. The save bar shows only on the "New entry" tab.
- **Step 18b: History, StatusBadge.** Shared `StatusBadge` (pending, syncing, failed, synced; color, icon and text together, with an `aria-label`), used on each card, plus the pending count on the History tab. Styleguide shows all four states.
- **Step 18c: History, fix-and-resend.** On a failed record, "Fix and resend" edits the record and sets it back to `pending` (local only; the real send is Step 21).
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