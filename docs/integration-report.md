# HomePulse Frontend-Backend Integration Report

## Executive Summary
This report analyzes the integration between the HomePulse frontend (React Native/Expo) and backend (Pure TS Engine, SQLite, Zustand) modules. While the initial integration points (dynamic ActionState rendering, database initialization, and sync queue status banners) have been implemented, a deep code audit has uncovered additional functionality gaps. Specifically, multiple backend/service-level features (task updates, local push notifications, translation loading, and AI reasoning generation) are fully coded and unit-tested but not yet called or active within the UI screens.

---

## Part 1: Previous Findings & Status

| # | Finding / Issue | Impact | Status | Resolution Detail |
| :- | :--- | :--- | :--- | :--- |
| 1 | **Inconsistent Action State Data:** `action-state.tsx` manually recreated ActionState metadata. | UX out-of-sync with rules | **Resolved** | Now consumes the dynamic `activeCase.triage_output` directly. |
| 2 | **Proactive Database Initialization:** Root `_layout.tsx` did not initialize the database. | Race conditions / lags | **Resolved** | `getDb()` is called proactively in `app/_layout.tsx`'s startup effect. |
| 3 | **Sync Queue Visibility:** Sync queue operations were completely invisible in the UI. | No feedback on cloud sync | **Resolved** | `NetworkBanner.tsx` displays syncing status or pending update counts. |

---

## Part 2: Newly Identified Integration Gaps

### 1. Incomplete Sync Queue Payload for Case Summaries
* **Issue:** In [case.ts](file:///c:/Users/harsh/My%20projects/HomePulse/store/case.ts), when an initial Supabase publish fails and gets enqueued to the local `sync_queue` table, the enqueued payload is only `{ caseId, token }`.
* **Impact:** Critical. The sync worker attempts to parse this payload as a full `CaseSummary` object. Because required fields like `created_at` and `state_level` are missing, the background upsert to Supabase fails indefinitely.
* **Resolution:** Define and pass the full `CaseSummary` object to `enqueueSyncOperation()`.

### 2. Missing Caregiver Task Checklist UI
* **Issue:** The `useTasksStore` and database queries successfully handle task creation, completion, and Supabase synchronization, but the frontend lacks any screen or card allowing the primary caregiver to interact with these tasks.
* **Impact:** High. Task tracking is central to the home care coordination protocol but currently unreachable for the primary user.
* **Resolution:** Add a task checklist directly to the active case card on the Home screen using the existing `TaskList` component.

### 3. Local Push Notification Reminders are Inactive
* **Issue:** The local notification helper in [notifications.ts](file:///c:/Users/harsh/My%20projects/HomePulse/services/notifications.ts) is fully implemented but is never called.
* **Impact:** Medium. The user receives no reminders to recheck the patient when the triage-specified interval is reached.
* **Resolution:** Call `scheduleRecheckNotification()` inside the case evaluation action when a non-zero recheck interval is returned.

### 4. i18n Localization is Never Loaded
* **Issue:** None of the UI components use the `useTranslation()` hook, and the translation config is never imported in the root layout, keeping all text hardcoded in English.
* **Impact:** Medium. Hindi/multilingual capabilities are inactive.
* **Resolution:** Import the i18n setup in `app/_layout.tsx` and wire up the `useTranslation` hook across the Home, settings, and result screens.

### 5. In-Memory Household Store State Reset
* **Issue:** The `useHouseholdStore` is purely in-memory and resets to default values if the app is closed and reopened.
* **Impact:** Medium. The symptom check-in screens will verify incorrect resources unless they are reloaded from the database.
* **Resolution:** Load the latest household snapshot from the database into the household store when loading the active case.

---

## Part 3: Recommended Next Steps
1. Create a `supabase_schema.sql` documentation script to enable database table setup.
2. Fix the sync queue enqueuing payload in `store/case.ts`.
3. Add a checklist to `app/(tabs)/home.tsx` to display active caregiver tasks.
4. Call notification scheduling on successful triage checks.
5. Wire up the translation engine in `_layout.tsx` and screens.
