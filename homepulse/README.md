# HomePulse

## Project Overview
HomePulse is an offline-first Expo/React Native family health triage decision-support app that helps households track symptoms, evaluate urgency via deterministic rules, and coordinate follow-up care safely.

## Architecture Principles
- Offline-first local data storage with SQLite as the default source of truth
- Deterministic triage engine with no LLM or randomness in the clinical decision path
- Red-flag-first safety evaluation before any non-urgent routing
- Sync and AI features are optional and never on the critical path
- Versioned rule configuration with explicit signatures for auditability

## Quick Start
```bash
npx create-expo-app@latest homepulse --template blank-typescript
cd homepulse
npm install
npm run start
```

## Running Tests
```bash
npm test
```

## WHO IMCI Test Cases
The `engine/__tests__/evaluator.test.ts` suite includes five baseline WHO IMCI-grounded scenarios: mild fever monitor-at-home, moderate fever guided home care, infant under 3 months fever red flag, low SpO2 immediate escalation, and multi-dimension worsening trajectory auto-escalation.

## Environment Setup
Copy `.env.example` to `.env` and fill Supabase, Claude, and PostHog keys as needed. Keep sync and AI feature flags disabled unless explicitly enabled.

## Build
```bash
npm run build:android
npm run build:ios
```

## Roadmap
- Phase 1: Offline triage engine, profile management, and local recheck workflows
- Phase 2: Caregiver collaboration, QR share flows, and household readiness enhancements
- Phase 3: Optional sync/analytics/AI explanation improvements with strict safety boundaries

## Clinical Disclaimer
HomePulse provides non-diagnostic decision support and is not a medical device; users should seek licensed medical care for diagnosis and treatment decisions.
