Rules folder

This directory contains versioned triage rules used by the `engine/` evaluator.

Authoring
- Rules are JSON files under `engine/rules/` with semantic versioned filenames (e.g., `v1.0.0.json`).

Signing
- Rules are signed with `scripts/sign-rules.ts`. Ensure you follow the signing process before shipping rule updates.

Versioning
- Keep backward-incompatible changes in a new major version file and update any migration or compatibility layer in `engine/`.
