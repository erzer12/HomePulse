# Product Definition

## Vision
HomePulse is a robust, offline-first mobile application designed to empower informal caregivers, community health workers, and patients. Its primary focus is the early detection of red-flag symptoms through a deterministic clinical triage engine, ensuring safety, timely escalation, and consistent monitoring in low-resource settings.

## Target Audience
- **Informal Caregivers:** Family members providing home care.
- **Community Health Workers (CHWs):** Operating in areas with limited medical access.
- **Patients:** Self-monitoring their own health symptoms.

## Core Clinical Objective
- **Red-flag Detection & Triage:** Rapid identification and escalation of severe health issues using a pure, deterministic offline logic engine.
- **Safety First:** Rule configurations are cryptographically signed (HMAC-SHA256). In case of engine failure, the system falls back to a conservative triage state (e.g., Teleconsult) to ensure patient safety.

## Offline & Sync Strategy
- **Offline-First Architecture:** All core triage and persistence logic (SQLite) runs locally on the device without requiring an internet connection.
- **Robust Syncing:** Network operations (like sharing summaries) are added to a reliable local `sync_queue` with idempotency and automatic retry logic upon network reconnection.
- **Non-Blocking UI:** Backend integrations (Supabase sync, AI explanations) are treated as non-critical enhancements that never block the main triage flow.

## Key Differentiators
- **Deterministic Clinical Engine:** Provides safe, offline triage rules without relying on cloud computation or opaque AI logic for primary decisions.
- **Secure Caregiver Collaboration:** Facilitates sharing of anonymized case summaries with doctors or other caregivers using high-entropy secure tokens.
- **Privacy & Data Security:** Built with strict data retention rules, append-only symptom logs, and plans for at-rest encryption to protect patient data.