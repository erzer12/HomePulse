Persistence and sync notes

Where data lives
- `db/` contains the SQLite schema and migrations used for local persistence.
- `store/` contains Zustand stores and in-memory representations; some lightweight values may use AsyncStorage.

When to use SQLite vs AsyncStorage
- Use SQLite for structured, queryable data (cases, patients, tasks) and for larger datasets.
- Use AsyncStorage for small key-value flags, feature toggles, or last-sync metadata.

Offline sync
- Keep a single sync coordinator in `store/` (or `services/sync.ts`) responsible for:
  - detecting connectivity
  - applying outgoing changes and queuing when offline
  - resolving simple conflicts (last-write-wins) or delegating to server conflict resolution

Testing
- Provide a seeded DB (`scripts/seed-test-data.ts`) for local development and CI tests.
