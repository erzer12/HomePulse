# Backend Architecture & Contracts (HomePulse)

This document summarizes module boundaries, public APIs, data contracts, and error/sync guarantees for the HomePulse backend code that runs inside the app.

## Scope
- Critical path (offline-first): triage engine (`engine/`), local persistence (`db/`), stores (`store/`), and local notifications (`services/notifications.ts`).
- Non-critical enhancements: Supabase sharing, AI explanations (in `services/`), sync queue flushing.

## Module responsibilities
- `engine/` — Pure TypeScript clinical logic. Public entry: `evaluate(input: TriageInput): TriageOutput` exported from `engine/index.ts`.
- `db/` — Schema (`db/schema.ts`), connection (`db/connection.ts`), and query functions (`db/queries/*`). All DB access goes through queries.
- `store/` — Zustand stores that expose the only interfaces UI uses. Stores must catch and surface errors via state fields.
- `services/` — Integrations (`notifications`, `supabase`, `ai`, `share`). Called by stores; failures are queued rather than blocking UI.
- `utils/` — Helpers such as rule config verification (`utils/crypto.ts`).

## Public APIs and contracts
- `engine.evaluate(input: TriageInput): TriageOutput` — synchronous. Deterministic. Never import React Native modules.
- `getDb(): Promise<SQLiteDatabase>` (in `db/connection.ts`) — singleton that returns a database instance with async helpers: `runAsync`, `getAllAsync`, `getFirstAsync`, `execAsync`.
- Query function signatures: examples exist in `db/queries/*` (e.g. `getPatients(db)`). Follow existing conventions (append-only `symptom_entries`).
- Stores: `usePatientStore`, `useCaseStore`, `useHouseholdStore` — keep interfaces stable; actions return `Promise` and set `error`/`loading` fields instead of throwing.

## Rule config & secrets
- Rules stored in `engine/rules/v{semver}.json`. Signed with HMAC-SHA256. `utils/crypto.ts` exposes `verifyRuleConfig(config)` to validate.
- **Important security note:** Do NOT store signing keys or third-party API secrets as `EXPO_PUBLIC_*` environment variables — these are embedded in the client bundle and can be extracted. Recommended approaches:
	- Production: perform rule verification and any LLM API calls on a trusted server-side proxy. Devices send only the `TriageOutput` or fetch verified configs from the server.
	- Short-term/demo: embed a build-time constant (not published as an `EXPO_PUBLIC_` env) and document the risk; rotate keys before any pilot with real data.

## Share tokens & privacy
- Share tokens should have sufficient entropy. Use 128-bit tokens (32 hex chars) or UUIDv4 to avoid trivial brute-force enumeration. Do not include patient-identifying fields in shared summaries.
- Be conservative about what fields are included in `case_summaries` (Supabase). Even without names, combinations of timestamps, symptom timelines, and household data can be re-identifying.

## Sync queue robustness
- `sync_queue` entries include `idempotency_key`, `retry_count`, `max_retries`, `priority`, and `last_error` to support idempotency and bounded retries. Implementations should:
	- Provide an `idempotency_key` for operations that may be retried (e.g., publishCaseSummary upsert). Use UUIDs or stable hashes.
	- Increment `retry_count` on failure and stop retrying when `retry_count >= max_retries` (surface an error to the store/UI).
	- Evict or compact old queue items when the queue grows beyond a sensible device-bound size (e.g., 10k entries); surface a non-blocking banner if pruning occurs.

## Data retention & encryption
- Add explicit delete/purge flows: stores and queries should implement `deletePatient(id, { purge: boolean })` which either anonymizes or fully purges related data (cases, symptom_entries, snapshots). Document retention defaults (e.g., keep 365 days unless user requests deletion).
- At-rest encryption: for pilot/production, integrate SQLCipher or rely on OS-level file encryption. Do not store unencrypted PII in cloud backups unless consented and encrypted server-side.

## Error handling
- On engine internal error (corrupt rules, malformed input), `evaluate()` should log the error (analytics) and return a conservative fallback `ActionStateLevel = 3` (teleconsult) plus an `error` string in the `TriageOutput`. This is intentional — safer than returning `1` (monitor).
- Engine implementations must never throw uncaught errors to the UI; catch internally and return safe fallbacks when appropriate.
- Stores: catch errors and set `error` and `loading` state fields — do not throw to UI. Store actions should return a `Promise` and update state to reflect success/failure so the UI can render non-blocking banners.
- SQLite and network errors: surface user-friendly messages in the store `error` field; queue failed network operations to `sync_queue` for retry.
- Rule verification failure: log to analytics, fall back to last-known-good rules, and surface an engineering-facing error in store state.

## Sync & offline guarantees
- `symptom_entries` is append-only. Local-first writes complete synchronously.
- Network operations are queued to `sync_queue` and retried on foreground or network reconnect.

## Testing / Acceptance (Step 1)
- `engine/index.ts` exports `evaluate`. `db/connection.ts` exports `getDb`. Type stubs for queries must exist. README updated.

---
Created as the initial architecture & contracts draft to support implementation. Modify as needed.
