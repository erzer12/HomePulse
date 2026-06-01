# HomePulse Frontend-Backend Contract

This document is the integration guide for the frontend. Use the Zustand stores and engine entry points below instead of calling SQLite or Supabase directly from screens.

## 1. Integration Rule

- Read data through `store/*` hooks.
- Write data through the same stores so offline persistence, retry, and sync stay consistent.
- Call `engine/evaluate()` for triage decisions.
- Avoid direct `db/*` access from UI code unless you are adding a new repository-level query helper.

## 2. Public Frontend API Surface

### Patients

Use `usePatientStore` from `store/patient.ts`.

- `loadPatients()` loads cached patient profiles into `profiles`.
- `createPatient(data)` creates a patient and updates local state.
- `getPatient(id)` returns a single patient or `null`.
- `updatePatient(id, data)` persists edits and refreshes local state.
- `deletePatient(id)` removes a patient and refreshes local state.

Types live in `types/patient.ts`:

- `Patient`
- `PatientInput`
- `PatientUpdateInput`

### Cases and triage

Use `useCaseStore` from `store/case.ts`.

- `createCaseForPatient(patientId)` creates a new active case.
- `loadActiveCase(patientId)` loads the current active case.
- `appendSymptomEntry(entry)` persists a symptom observation.
- `evaluateCase(caseId)` runs the triage engine, stores the result, and returns `TriageOutput`.
- `closeCase(caseId)` closes the case.
- `setShareToken(caseId)` creates a share token and attempts to publish a case summary.

Relevant types live in `types/triage.ts` and `types/case.ts`:

- `SymptomEntry`
- `TriageInput`
- `TriageOutput`
- `ActionState`
- `CaseRecord`

### Tasks

Use `useTasksStore` from `store/tasks.ts`.

- `loadTasksForCase(caseId)` loads all tasks for a case.
- `createTask(caseId, title, description?)` creates a task.
- `markDone(taskId, caseId)` marks the task complete and enqueues a retry if remote update fails.

## 3. Data Flow by Screen

### Onboarding

- Collect patient data with the form.
- Call `usePatientStore.createPatient()`.
- Then call `useCaseStore.createCaseForPatient()` for the new profile.

### Home

- Call `usePatientStore.loadPatients()` and `useCaseStore.loadActiveCase()`.
- Render the current patient and active case from store state.
- Do not synthesize triage output in the UI.

### Symptom check

- Build a `SymptomEntry` from questionnaire answers.
- Call `useCaseStore.appendSymptomEntry()`.
- Call `useCaseStore.evaluateCase()`.
- Use the returned `TriageOutput.action_state` to navigate to the result screens.

### Caregiver tasks

- Use `useTasksStore.loadTasksForCase()` when the case changes.
- Use `createTask()` and `markDone()` for task management.

### Sharing

- Use `useCaseStore.setShareToken()`.
- The backend will persist the token locally and attempt to publish a summary to Supabase.
- If the network is unavailable, the operation is queued automatically for retry.

## 4. Offline and Sync Behavior

The app is offline-first.

- SQLite is the source of truth for patients, cases, symptoms, and tasks.
- `services/sync.ts` writes failed remote operations into `sync_queue`.
- `flushSyncQueue()` retries queued operations in priority order.
- `services/supabase.ts` is only used through the stores and sync worker.

What the frontend should expect:

- Optimistic local updates may happen before remote confirmation.
- A task or case action may succeed locally and sync later.
- Errors should be shown from store `error` state when available.

## 5. Triage Engine Contract

Use `evaluate(input)` from `engine/index.ts`.

Input shape:

- `patient`: age group, optional age in months, chronic conditions.
- `symptom`: one `SymptomEntry`.
- `symptom_history`: previous `SymptomEntry[]`.
- `household`: readiness inputs such as thermometer, oximeter, transport, pharmacy distance, caregiver, and medicine stock.

Output shape:

- `action_state.level` is the primary severity signal from 1 to 4.
- `action_state.label` and `action_state.explanation` are safe to render.
- `red_flag_triggered` indicates urgent escalation.
- `household_modifiers_applied` explains any adjustments.
- `error` is present only for engineering/debug fallback handling.

## 6. State and Error Handling

- Each store exposes `loading` and `error` fields.
- Treat `loading` as a request-in-flight indicator, not a screen-level blocker.
- Use `error` for user-facing fallback messaging, but keep triage safe even when evaluation fails.

## 7. Environment and Configuration

- Expo SDK 56 uses `expo/tsconfig.base.json` in the root `tsconfig.json`.
- Supabase configuration comes from `constants/config.ts` and environment variables.
- Rule signing is handled in `engine/rules/` and `scripts/sign-rules.ts`.

## 8. Recommended Import Paths

Use the root alias everywhere in app code:

- `@/store/patient`
- `@/store/case`
- `@/store/tasks`
- `@/engine`
- `@/types/triage`

## 9. Minimal Frontend Examples

```ts
import { usePatientStore } from "@/store/patient";
import { useCaseStore } from "@/store/case";

const patient = await usePatientStore.getState().createPatient({
  name: "Asha",
  age_group: "child",
  age_months: 36,
  chronic_conditions: [],
});

const caseRecord = await useCaseStore.getState().createCaseForPatient(patient.id);
```

```ts
import { evaluate } from "@/engine";

const output = evaluate({
  patient: {
    age_group: "child",
    chronic_conditions: [],
  },
  symptom,
  symptom_history,
  household,
});
```

## 10. What Not to Do

- Do not query SQLite directly from screens if a store method already exists.
- Do not call Supabase directly from UI flows that already route through stores.
- Do not reimplement triage logic in components.
- Do not assume remote success; always preserve the local result first.
