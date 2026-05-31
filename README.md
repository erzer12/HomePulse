# HomePulse

Short developer README with run steps and architecture notes.

Getting started

Install dependencies and start the Expo dev server:

```bash
npm install
npm start
```

Run tests:

```bash
npm test
```

Architecture (high level)

- `app/` — Expo Router file-based routes and screens.
- `components/`, `ui/` — Reusable presentational components.
- `engine/` — Core triage evaluation logic and versioned rules (`engine/rules/`).
- `services/` — External integrations (AI, Supabase, notifications).
- `store/` — Application state (Zustand) and persistence helpers.
- `db/` — SQLite schema and migrations.
- `types/` — Shared TypeScript types (exported from `types/index.ts`).

Important notes

- Rules are versioned JSON in `engine/rules/` and signed using `scripts/sign-rules.ts`.
- Secrets should be provided via environment variables; see `.env.example`.
- Tests focus on `engine/`, `utils/`, and `store/` (see `package.json` Jest config).

Recommended next improvements

- Add CI (GitHub Actions) to run tests and lint on push/PR.
- Centralize API clients under `services/*/client.ts` for easier testing/mocking.
- Document offline sync/persistence behavior more fully in `docs/persistence.md`.
