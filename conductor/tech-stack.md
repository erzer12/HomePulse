# Technology Stack

## Languages
- **TypeScript:** Primary language for all application logic, engine components, and React Native UI.

## Frameworks & Libraries
- **React Native (Expo v56):** Core mobile framework for building iOS and Android applications.
- **Expo Router:** File-based routing for navigation across screens.

## State Management
- **Zustand:** Lightweight state management for application state (patients, cases, and household data).

## Database & Persistence
- **expo-sqlite:** Primary local database for offline-first, structured persistence of health data.
- **AsyncStorage:** Used strictly for non-critical metadata and UI preferences.

## Backend & Integrations
- **Supabase:** Used for caregiver synchronization and sharing functionality (non-critical path).
- **expo-notifications:** Local push notifications for scheduling triage rechecks.
- **i18next:** Internationalization support (English/Hindi).