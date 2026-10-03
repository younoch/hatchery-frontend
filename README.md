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

Where the plan and the prototype differ on visual details (spacing, sizes, layout), the prototype wins. `AGENTS.md` lists the known differences.

## Tech stack

Vue 3, Vite, TypeScript (strict), Pinia, Zod, VeeValidate with shadcn-vue forms, Tailwind, shadcn-vue (Reka UI), vue-i18n (Bangla default, English), Dexie (IndexedDB), vite-plugin-pwa, D3 (calculation only), pnpm.

## Getting started

```bash
pnpm install
pnpm dev
```

The scripts below are added in Step 1 of the plan. Until then only `dev` and `build` exist.

| Script | Purpose |
|---|---|
| `pnpm dev` | Start the dev server. |
| `pnpm build` | Production build. |
| `pnpm lint` | ESLint and Prettier check. |
| `pnpm typecheck` | Type check with `vue-tsc`. |

Testing the PWA and service worker needs HTTPS (local certificates with `mkcert`, set up in the PWA step).

## Planned structure

```
src/
  mobile/     phone layout: views, nav components, shell
  desktop/    desktop layout: views, nav components, shell
  shared/     api, stores, storage (IndexedDB and sync queue), composables,
              schemas (Zod), types, charts, locales
  router/     root redirect guard
```

`mobile/` and `desktop/` contain no API calls or business logic. Everything shared lives in `shared/`.

## Working with an AI assistant

Start every session by telling the assistant to read `AGENTS.md`, then `PROGRESS.md`. It works on one step, stops with a short report, and waits for your review before doing anything else.

## Conventions

- Commits follow the Conventional Commits format, for example `feat(auth): add refresh interceptor`.
- One commit per step or sub-step.
- No `v-html`, no hardcoded UI text (all text goes through i18n keys), no hardcoded colors or spacing (design tokens only).