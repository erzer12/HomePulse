# Frontend Mock Data Report

Audit date: 2026-06-02

Scope: `app/`, `components/`, `store/`, `services/`, `constants/`, `utils/`, `i18n/`, and `types/` files that can affect frontend/runtime UI. Test fixtures in `__tests__` were excluded except where noted by search.

## Summary

The frontend still contains multiple production-visible mock data blocks. The highest-risk areas are the symptom assessment flow, result/explanation screens, caregiver share screens, profiles tab, and history tab. Several screens display a hardcoded patient name (`Rohan`) or account name (`Abishek`) even though patient and case stores exist.

Counts by category:

- Critical mock-driven screens: 6
- Partial mock/default-state screens: 5
- Placeholder/nonfunctional actions: 4
- Legitimate static option lists/constants: 5
- Service fallback templates: 1

## Critical Production-Visible Mock Data

### 1. Symptom questionnaire is a hardcoded fever-only mock flow

File: `app/symptom-check/questionnaire.tsx`

Lines:

- `20`: `// --- Fever Question Set (Mock based on Spec) ---`
- `21`: `FEVER_QUESTIONS`
- `48`: hardcoded `Rohan` in “Is Rohan drinking fluids normally?”
- `65`: hardcoded `Rohan` in “How alert is Rohan right now?”
- `89-90`, `113`, `149`, `278`: UI flow is driven by `FEVER_QUESTIONS`

What it does:

- Presents only a fever questionnaire regardless of selected symptom.
- Hardcodes patient identity as `Rohan`.
- Stores answers only in local component state; no case/symptom entry is persisted.
- Finishes by routing to `/symptom-check/household-check`, not by evaluating real triage data.

Risk:

- High. This is central clinical UX and can show incorrect questions for non-fever symptoms.
- High. Patient identity mismatch is visible and confusing.

Recommended replacement:

- Drive questions from selected symptom/category and patient profile.
- Replace `Rohan` with the active case patient name from `useCaseStore` + `usePatientStore`.
- Persist answers through `appendSymptomEntry`.
- Run `evaluateCase` before routing to result screens.

### 2. Household check screen uses mock readiness instead of store/database

File: `app/symptom-check/household-check.tsx`

Lines:

- `60`: `// Mock readiness data (normally from useHouseholdStore)`
- `61-68`: hardcoded readiness object
- `67`: hardcoded distance `"1.5 km"`

What it does:

- Displays fixed resources:
  - thermometer: yes
  - oximeter: no
  - transport: yes
  - caregiver: yes
  - medicine: yes
  - distance: `1.5 km`
- Does not read `useHouseholdStore` or latest `household_snapshots`.

Risk:

- High. Recommendations can appear based on resources the household does not actually have.

Recommended replacement:

- Read current readiness from `useHouseholdStore`.
- If tied to a case, load latest snapshot from `household_snapshots`.
- Let “Update Resources” mutate the same source used by evaluation.

### 3. Result action-state screen is fully mock-driven

File: `app/result/action-state.tsx`

Lines:

- `9`: `// Mock data for State 2 (Guided Home Care)`
- `10-34`: `MOCK_RESULT`
- `15`: hardcoded `Rohan`
- `58`, `64`, `70`: UI renders `MOCK_RESULT`

What it does:

- Always shows state level 2 / “Guided Home Care.”
- Always shows the same care steps:
  - paracetamol
  - fluids
  - ventilation
- Always shows recheck interval `4 hours`.

Risk:

- Critical. This is a clinical recommendation screen and can contradict the actual triage engine output.

Recommended replacement:

- Read latest `TriageOutput` from case state or route params.
- Render `output.action_state`, `output.care_instructions`, `output.red_flags`, and `output.recheckIntervalMinutes`.
- Avoid patient-specific copy unless sourced from the active patient profile.

### 4. Explanation screen is fully mock-driven

File: `app/result/explanation.tsx`

Lines:

- `16`: `// --- Mock Data ---`
- `17-44`: `MOCK_REASONING`
- `20`: hardcoded temperature `39.2°C`
- `26`: hardcoded `Rohan`
- `70`, `76`, `82`, `85`, `96`, `122`, `133`, `158`: UI renders `MOCK_REASONING`

What it does:

- Displays fixed assessment values:
  - temperature: `39.2°C`
  - hydration: `Normal`
  - alertness: `Slightly lethargic`
  - breathing: `Normal`
- Displays fixed reasoning, care steps, and urgent triggers.

Risk:

- Critical. It presents mock clinical reasoning as if derived from the user's answers.

Recommended replacement:

- Render from persisted symptom entry + triage output.
- Use `services/ai/client.ts` or rule explanation data only after real `evaluateCase`.
- Include the actual inputs that triggered each recommendation.

### 5. Caregiver shared view is fully mock-driven

File: `app/caregiver-share/shared-view.tsx`

Lines:

- `9`: `// Mock data based on the Google Stitch design`
- `10-15`: `MOCK_STATE`
- `17-27`: `MOCK_TASKS`
- `43`: hardcoded `Patient: Child`
- `45`: hardcoded `Last updated: 12 mins ago`
- `49`, `54`: UI renders mock state/tasks

What it does:

- Always shows a child patient.
- Always shows state level 2 / “Guided Home Care.”
- Always shows three static caregiver tasks.
- Does not parse token or fetch shared case summary.

Risk:

- High. A shared read-only view can show entirely unrelated care tasks.

Recommended replacement:

- Read token from route/deep link.
- Fetch shared summary from Supabase or local published cache.
- Render actual case state, patient display name/age group, updated timestamp, and tasks.

### 6. History tab is fully mock-driven

File: `app/(tabs)/history.tsx`

Lines:

- `10-43`: `MOCK_HISTORY`
- `13`, `24`, `34`: hardcoded timestamps
- `16`, `27`, `37`: hardcoded temperatures
- `128`: `data={MOCK_HISTORY}`
- `136`: hardcoded `Started 2 days ago`
- `143`: hardcoded `Guided Home Care (Level 2)`

What it does:

- Always shows three timeline entries.
- Always shows the same temperatures, hydration values, notes, and state history.
- Does not query active case or `symptom_entries`.

Risk:

- High. Gives a false clinical timeline.

Recommended replacement:

- Load active or selected case.
- Query `getSymptomHistory`.
- Derive state badges from each entry's stored `triage_output`.
- Compute “started” and timestamps from DB fields.

## Partial Mock or Hardcoded Runtime Data

### 7. Profiles tab ignores real patient store

File: `app/(tabs)/profiles.tsx`

Lines:

- `25-43`: `MOCK_PROFILES`
- `28`: hardcoded `Rohan`
- `29`: hardcoded `Child (8 yrs)`
- `32`: hardcoded `2 hours ago`
- `37`: hardcoded `Meera`
- `38`: hardcoded `Infant (10 months)`
- `41`: hardcoded `Yesterday`
- `69`: UI maps `MOCK_PROFILES`

What it does:

- Displays two fake profiles even if the real patient table has different profiles.
- “Edit Profile” is nonfunctional.

Risk:

- High. Patient management tab is not reflecting persisted data.

Recommended replacement:

- Use `usePatientStore.loadPatients()` and `profiles`.
- Join active case status from `useCaseStore` or case queries.
- Replace age display with derived `age_group` / `age_months`.

### 8. Share link screen uses a demo token and hardcoded patient name

File: `app/caregiver-share/share-link.tsx`

Lines:

- `11`: `homepulse://case/abc123_demo`
- `16`: hardcoded `Rohan` in share message
- `37`: hardcoded `Rohan` in subtitle

What it does:

- QR code and share message always use `abc123_demo`.
- Does not call `useCaseStore.setShareToken`.
- Does not use the actual patient name or case token.

Risk:

- High. Generated share links will not map to real shared cases.

Recommended replacement:

- Require active case ID.
- Call `setShareToken(caseId)`.
- Build link with `generateShareLink(token)`.
- Source patient name from active case patient profile.

### 9. Recheck escalation alert uses hardcoded worsening scenario

File: `app/recheck/escalation-alert.tsx`

Lines:

- `9-13`: `MOCK_CHANGES`
- `10`: hardcoded `38.2°C` to `39.6°C`
- `38`: hardcoded `Rohan`
- `44`: UI maps `MOCK_CHANGES`
- `15-20`: static `STATE_URGENT`

What it does:

- Always shows urgent worsening due to temperature, hydration, and consciousness.
- Does not compare current input against previous symptom entry.

Risk:

- High if reachable from real flows; moderate if currently only a design route.

Recommended replacement:

- Compute changes from previous and current symptom entries.
- Use actual evaluated action state.
- Replace hardcoded patient name.

### 10. Recheck check-in starts with hardcoded values and identity

File: `app/recheck/check-in.tsx`

Lines:

- `11`: `useState("38.2")`
- `25`: hardcoded `Rohan`
- `61`: hardcoded option list `["Normal", "Reduced", "Poor"]`
- `80`: hardcoded option list `["Alert", "Sleepy", "Drowsy"]`

What it does:

- Temperature input defaults to `38.2`.
- Patient name is hardcoded.
- Hydration/alertness selections are visual only; buttons do not persist selected state.

Risk:

- Medium to high. It can look like a real recheck while not saving or evaluating data.

Recommended replacement:

- Initialize empty values or last known values explicitly labeled as previous readings.
- Source patient name from active case.
- Persist a new symptom entry and evaluate.

### 11. Home tab hardcodes account greeting and generic care tip

File: `app/(tabs)/home.tsx`

Lines:

- `80`: hardcoded `Hello, Abishek`
- `81-83`: hardcoded household-ready message
- `39-58`: static action-state mapping from level to generic copy
- `181-183`: generic hydration tip using patient name

What it does:

- Mixes real `activeCase` / `profiles` with hardcoded account identity.
- State mapping is not full triage output; it invents generic copy from level.

Risk:

- Medium. Less dangerous than result screens, but still misleading.

Recommended replacement:

- Source caregiver/account name from settings/profile once available, or use neutral copy.
- Store and render latest `TriageOutput` instead of reconstructing from numeric level alone.

### 12. Settings screen hardcodes account identity and uses no-op data management

File: `app/(tabs)/settings.tsx`

Lines:

- `56`: default language `en`
- `78`: `console.log("Data cleared")`
- `101`: hardcoded `Abishek`
- `177`: export row has empty `onPress={() => {}}`

What it does:

- Shows a fake account profile.
- “Clear All Data” only logs to console.
- “Export All Health Data” does nothing.

Risk:

- Medium. User-visible account and data management behavior is not real.

Recommended replacement:

- Connect account/profile name to persisted user/caregiver profile.
- Implement DB clear/export or disable these actions until available.

### 13. Household setup has opinionated default resource values

File: `app/onboarding/household-setup.tsx`

Lines:

- `51-57`: default resources
- `58`: default distance `"1.5"`
- `156`: placeholder `"1.5"`

What it does:

- Defaults thermometer, transport, caregiver, and medicine to `true`; oximeter to `false`.
- Defaults pharmacy distance to `1.5`.

Risk:

- Medium. These values are saved if the user continues without changing them.

Recommended replacement:

- Consider neutral defaults or require explicit confirmation.
- If this is intentional UX, keep but document as default assumptions rather than mock data.

## Placeholder or Nonfunctional UI

### 14. Landing screen uses placeholder illustration shapes

File: `app/index.tsx`

Line:

- `24`: `In a real app, this would be a high-quality SVG or PNG illustration`

What it does:

- Uses decorative circles instead of a real illustration.

Risk:

- Low. Visual polish issue, not data integrity.

### 15. Emergency dialer button is a no-op

File: `app/symptom-check/select-symptom.tsx`

Line:

- `75`: `onPress={() => {}} // Integration for dialer`

Risk:

- Medium. Emergency CTA appears functional but does nothing.

Recommended replacement:

- Use `Linking.openURL("tel:112")` with confirmation/copy fallback.

### 16. Print/share/copy actions are incomplete

Files:

- `app/result/explanation.tsx`: `Print Summary` has `onPress={() => {}}`
- `app/caregiver-share/share-link.tsx`: copy icon has no `onPress`
- `app/result/action-state.tsx`: header share icon has no action

Risk:

- Low to medium. They are user-facing affordances that do not perform their implied action.

Recommended replacement:

- Implement or hide until implemented.

## Legitimate Static Data, Not Mock Data

These are static option lists or defaults that are acceptable if they reflect product rules, though they may still need localization/configuration later.

### Age groups and conditions

File: `app/onboarding/create-profile.tsx`

Lines:

- `18-23`: `AGE_GROUPS`
- `25`: `CONDITIONS`

Assessment:

- Static form options, not mock records.
- `CONDITIONS` may need expansion/localization, but it is not fake user data.

### Symptom categories

File: `app/symptom-check/select-symptom.tsx`

Lines:

- `12-20`: `SYMPTOM_CATEGORIES`

Assessment:

- Static product taxonomy, not mock records.
- IDs should eventually align exactly with `SymptomCategory` enum/schema values.

### Household default readiness store

File: `store/household.ts`

Lines:

- `9-16`: `defaultReadiness`
- `19-21`: store initialization/reset

Assessment:

- Runtime defaults, not frontend mock data.
- Risk depends on whether evaluation falls back to these values without user confirmation.

### AI fallback templates

File: `services/ai/client.ts`

Lines:

- `3-8`: `FALLBACK_TEMPLATES`
- `24`, `37`, `45`: fallback usage

Assessment:

- Intentional offline/service-failure fallback, not mock records.
- Should be clearly treated as generic fallback text and not a replacement for rule-derived explanation.

### Share text default title

File: `services/share.ts`

Line:

- `14`: `title = "Shared case"`

Assessment:

- Generic default parameter, not mock data.

## Highest-Priority Cleanup Plan

1. Replace result screens with real triage output.
   - `app/result/action-state.tsx`
   - `app/result/explanation.tsx`

2. Replace profile/history tabs with DB-backed stores.
   - `app/(tabs)/profiles.tsx`
   - `app/(tabs)/history.tsx`

3. Wire share flow to real case tokens.
   - `app/caregiver-share/share-link.tsx`
   - `app/caregiver-share/shared-view.tsx`

4. Replace hardcoded `Rohan` and `Abishek` everywhere.
   - Source patient name from active case.
   - Use neutral copy where account identity does not exist yet.

5. Make recheck and questionnaire persist/evaluate real case data.
   - `app/symptom-check/questionnaire.tsx`
   - `app/symptom-check/household-check.tsx`
   - `app/recheck/check-in.tsx`
   - `app/recheck/escalation-alert.tsx`

6. Remove or disable no-op actions.
   - emergency call
   - print summary
   - copy share link
   - settings export/clear data

## Full File Inventory

Critical mock-driven:

- `app/symptom-check/questionnaire.tsx`
- `app/symptom-check/household-check.tsx`
- `app/result/action-state.tsx`
- `app/result/explanation.tsx`
- `app/caregiver-share/shared-view.tsx`
- `app/(tabs)/history.tsx`

Partial mock/hardcoded runtime data:

- `app/(tabs)/profiles.tsx`
- `app/caregiver-share/share-link.tsx`
- `app/recheck/escalation-alert.tsx`
- `app/recheck/check-in.tsx`
- `app/(tabs)/home.tsx`
- `app/(tabs)/settings.tsx`
- `app/onboarding/household-setup.tsx`

Placeholder/nonfunctional UI:

- `app/index.tsx`
- `app/symptom-check/select-symptom.tsx`
- `app/result/explanation.tsx`
- `app/caregiver-share/share-link.tsx`
- `app/result/action-state.tsx`
- `app/(tabs)/settings.tsx`

Legitimate static data/defaults:

- `app/onboarding/create-profile.tsx`
- `app/symptom-check/select-symptom.tsx`
- `store/household.ts`
- `services/ai/client.ts`
- `services/share.ts`
