# HomePulse Frontend Handover Documentation

> **Status:** UI/UX Phase Complete (High-Fidelity)  
> **Target:** Backend Integration Ready  
> **Author:** Gemini CLI (Frontend Agent)

## 1. Visual Language: "Guided Reassurance"
The frontend is built on a custom design system focused on calm, physical stability, and clarity under stress.

- **Tokens (`constants/colors.ts`):** Established a warm, paper-like palette (`#F7F3EE`). Never use pure black text; use Charcoal Ink (`#2E2A27`).
- **Motion (`constants/motion.ts`):** Implements Emil-style Design Engineering. Features staggered reveals (cascade effects) and tactile 0.97 scale-on-press feedback.
- **Rounding:** Signature **28px** rounding for all primary cards to feel approachable and stable.

## 2. Core Screen Architecture (`app/`)
Navigation is handled by **Expo Router** (file-based).

- **Onboarding (`app/onboarding/`):** Two-step flow. Step 1 collects patient metadata; Step 2 captures household resources (thermometers, transport).
- **Home Hub (`app/(tabs)/home.tsx`):** The primary dashboard. It handles two states: `Empty` (No active cases) and `Active Case` (Shows patient summary + ActionStateCard).
- **Triage Flow (`app/symptom-check/`):**
    - `select-symptom.tsx`: Large icon grid for fast entry.
    - `questionnaire.tsx`: A state-driven adaptive system that manages multi-type questions (Boolean, Numeric, Choice).
- **Clinical Results (`app/result/`):**
    - `action-state.tsx`: The high-level recommendation (Level 1-4).
    - `explanation.tsx`: Deep-dive into *why* the result was given (reasoning, assessed vitals, care steps).
- **History & Profiles:**
    - `app/(tabs)/history.tsx`: Vertical timeline with trend indicators (Rising/Falling fever arrows).
    - `app/(tabs)/profiles.tsx`: Expandable patient cards with quick actions.

## 3. Component System (`components/`)
Modular components are ready for data binding:

- **`ui/` (Foundations):** Atomic components like `Button`, `Card`, and `MotionView` (cascade wrapper).
- **`triage/` (Clinical):** `ActionStateCard` (auto-maps levels to colors) and `RecheckTimer`.
- **`caregiver/` (Coordination):** `TaskList` and `TaskItem` for shared monitoring assignments.
- **`icons/` (Symptom):** Custom `SymptomIcon` component with Lucide integration and touch feedback.

## 4. Technical Integration Points (For Backend)

### Path Aliases
We use `@/*` to reference the project root. This is configured in `tsconfig.json` and supported by a robust `.eslintrc.js` config to prevent path-resolution errors.

### State Management (Zustand)
The stores in `store/` are currently stubs or lightweight in-memory projections. 
- **Integration Task:** Connect `store/patient.ts` and `store/case.ts` to the local SQLite database.

### Clinical Engine (`engine/`)
- The UI in `questionnaire.tsx` is ready to pass its results to the engine's `evaluate()` function.
- **Integration Task:** Bind the completed questionnaire state to the evaluator and navigate to the results based on the output.

### Safe Areas
The app uses a global `SafeAreaProvider` in `app/_layout.tsx`. Screens use `useSafeAreaInsets` for dynamic top padding. Ensure any new screens follow this pattern to avoid "notches" or status bar collisions.

### Accessibility & I18n
- **Accessibility:** All interactive elements have `accessibilityLabel` and `accessibilityRole`.
- **Localization:** `i18n/en.json` and `i18n/hi.json` have the full hierarchy ready. Use the `t()` hook from `react-i18next` for all strings.

---

## 🏁 Handover Checklist for Partner
- [ ] Merge `frontend` branch into `main`.
- [ ] Run `npm install` (new dependencies added: `lucide-react-native`, `react-native-qrcode-svg`, `@react-native-community/netinfo`).
- [ ] Bind real SQLite queries to the `Profiles` and `History` list components.
- [ ] Replace mock data in `home.tsx` with the latest active case from `store/case.ts`.
