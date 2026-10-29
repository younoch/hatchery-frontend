# Hatchery Frontend

Offline-first web app (PWA) for hatchery field staff and owners in Cox's Bazar. The first species is shrimp and the first module is water quality (pH, salinity, oxygen, temperature). Most users are on Android phones with weak or no internet, so entering and viewing data must work offline and sync later.

The backend is a separate NestJS project. This repository is the frontend only.

## Status

Built one small step at a time, with a review after every step. The current step and its history are in [`PROGRESS.md`](./PROGRESS.md).

## Documents

| File | What it is |
|---|---|
| [`hatchery-frontend-plan-en.md`](./hatchery-frontend-plan-en.md) | The plan: architecture, offline behavior, security, API conventions, closed decisions. |
| [`hatchery-water-entry.html`](./hatchery-water-entry.html) | Clickable visual prototype. Open it in a browser. It is a design reference, not production code. |
| [`AGENTS.md`](./AGENTS.md) | Working instructions for an AI assistant: reading order, the step loop, hard rules, the step list. |
| [`PROGRESS.md`](./PROGRESS.md) | Which steps are done, decisions log, parking lot. |
| [`COMPONENTS.md`](./COMPONENTS.md) | Catalog of the shared components. Check it before building any UI. |
| [`COORDINATION.md`](./COORDINATION.md) | Temporary frontend-backend log of requests, questions and notices. Identical in both repos and deleted when the project ends. It is not the API contract: the contract is the backend `progress.md` and Swagger. |

Where the plan and the prototype differ on visual details (spacing, sizes, layout), the prototype wins. `AGENTS.md` lists the known differences. For anything backend-related, the backend `progress.md` and `COORDINATION.md` win over the plan.

## Tech stack

Vue 3, Vite, TypeScript (strict), Pinia, Zod (pinned to 3.25.76), VeeValidate with `@vee-validate/zod`, Tailwind 4 (tokens only), Reka UI primitives (shadcn-vue style), vue-i18n (Bangla default, English), Dexie (IndexedDB), vite-plugin-pwa, native `fetch` (no axios), D3 (calculation only), pnpm.

## Getting started

```bash
pnpm install
pnpm dev
```

The app needs `VITE_API_URL` in `.env`. It is validated at startup, and the app stops with an error if it is missing or invalid.

| Script | Purpose |
|---|---|
| `pnpm dev` | Start the dev server. |
| `pnpm build` | Production build. |
| `pnpm lint` | ESLint check (the Prettier rule is off). |
| `pnpm typecheck` | Type check with `vue-tsc`. |
| `pnpm check:i18n` | Check that the Bangla and English message files match. |
| `node scripts/check-layout-classes.mjs` | Check that views and built CSS follow the spacing rules. |

Run all of them before every commit: `pnpm lint && pnpm typecheck && pnpm build && pnpm check:i18n`, then the layout check.

The PWA, service worker and offline behavior are tested on the production Vercel link with a real Android phone, not on localhost. There is no local HTTPS setup.

## Structure

```
src/
  mobile/     phone layout: views, nav components, shell
  desktop/    desktop layout: views, nav components, shell
  shared/     api, stores, storage (IndexedDB and sync), composables,
              schemas (Zod), types, charts, locales
  router/     root redirect and auth guard
```

`mobile/` and `desktop/` contain no API calls or business logic. Everything shared lives in `shared/`.

## Working with an AI assistant

Start every session by telling the assistant to read `AGENTS.md`, then `PROGRESS.md` and `COORDINATION.md` (and `COMPONENTS.md` before any UI work). It works on one step, stops with a short report, and waits for your review before doing anything else.

## Conventions

- Commits follow the Conventional Commits format, for example `feat(auth): add refresh interceptor`.
- One commit per step or sub-step.
- No `v-html`, no hardcoded UI text (all text goes through i18n keys), no hardcoded colors or spacing (design tokens only).