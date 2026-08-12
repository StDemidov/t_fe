# AGENTS.md

## Repo layout

- Git repo root is `t_fe/` (the parent directory `/Users/stepandemidov/tishka-frontend` is just a wrapper — do all work here).
- React 18 + Vite 6. No TypeScript, no tests, no CI, no lint/typecheck scripts (`package.json` only has `start`/`build`/`preview`). Don't invent test/lint commands.
- Comments, slice names, and UI text are in **Russian**. Match that in new code/comments.

## Commands

- `npm start` — dev server on `http://localhost:3000` (`strictPort`, `host: true`).
- `npm run build` — outputs to `build/` (gitignored).
- `npm run preview` — serves the build.
- Backend is `http://localhost:8000` (see `src/utils/host.js`; prod URL `https://t-prjct.ru` is commented out). The app needs a running backend to work. Login is phone+password then TOTP/2FA.

## Architecture: legacy + FSD migration in progress

Two structures coexist. The FSD folders (`src/app`, `src/api`, `src/entities`, `src/features`, `src/pages`, `src/shared`, `src/widgets`) are **untracked in git** — this is an active migration.

- Legacy monolith lives in `src/components/**` (~78 folders) + `src/layouts/**` + `src/redux/**`. Routes are hardcoded in `src/App.jsx`.
- FSD: routes go in `src/app/router/newAppRoutes.jsx` (`NewAppRoutes` is currently commented out in `App.jsx`). Convention files: `_STRUCTURE.js` in `entities/features/widgets`, and copy `src/pages/_template/NewFeaturePage` for new pages.
- New feature imports `../../app/styles/global.css` (utility classes `.page`, `.card`, `.pageTitle`) and uses CSS Modules (`*.module.css`).
- Follow the FSD flow when adding a feature: `pages/` (thin route entry) → `widgets/` (UI blocks) → `features/` (user actions) → `entities/` (slice + api normalize). Keep it there; do not wire new routes into `App.jsx`.

## State & API

- Single store: `src/redux/store.js` with redux-persist. New `src/app/store/index.js` just re-exports it — keep it that way.
- Persist `whitelist`s matter: `inventory` must NOT persist `skuList`/`ordersMap` (too large → `QuotaExceededError`). Respect existing whitelists.
- API client: legacy `src/utils/host.js`; new `src/api/client.js` re-exports `hostName` from it. Both inject `Authorization: Bearer <token>` from `auth.user?.token`, dispatch `clearCredentials` on 401, redirect to `/forbidden` on 403.
- Slices live in `src/redux/slices/`, but some components keep feature-local slices (e.g. `src/components/inventory/redux/`). Store imports both — match whichever side you're editing.

## Styling

- Design tokens are CSS variables in `src/tokens/colors.css` (`--color-*`); `src/app/styles/tokens/index.css` re-imports it as the single source of truth.
- Legacy components use plain CSS; new FSD components use CSS Modules. Don't mix.

## HTML

- `index.html` has a `#tooltip-root` sibling of `#root` — rendered by `src/TooltipManager/TooltipManager.jsx`, required app-wide.
