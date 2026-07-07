# HomePulse

## Overview

**HomePulse** is an **Expo / React Native** application configured using **Expo Router** for navigation. The project is managed with TypeScript, uses **Zustand** for state management, **Zod** for validation, and integrates with **Supabase** for data persistence. It also includes tooling for code quality (Biome) and automated testing (Jest), along with scripts to seed test data and build releases via **EAS**.

---

## Key Features

- **Expo Router** entrypoint configuration (`expo-router/entry`)
- **Type-safe development** using TypeScript
- **Code quality automation**:
  - Linting
  - Formatting
  - Typechecking
  - Consistency checks via Biome
- **Automated testing** with Jest:
  - Standard runs
  - Watch mode
  - Coverage reporting
- **Test data seeding** via a dedicated npm script
- **Release builds** for **Android** and **iOS** using **EAS**
- **State management** with **Zustand**
- **Data validation** with **Zod**
- **Backend integration** via **Supabase** client
- **Internationalization** support (i18n)
- **Utilities** for QR generation and SVG usage
- **Analytics** integration
- **Dependency overrides** to enforce specific versions for consistent builds

---

## Tech Stack

### Runtime / App Dependencies (high-level)
- **Expo SDK modules** (via `expo/*`)
- **React** and **React Native**
- **Expo Router** for navigation
- **Supabase client** for backend services
- **Async storage** for persistence
- **Networking** (Expo networking utilities)
- **i18n** for localization
- **State management**: **Zustand**
- **Validation**: **Zod**
- **Utilities**:
  - QR-related utilities
  - SVG handling
- **Analytics** integration
- Additional commonly used Expo/React Native supporting libraries are included in the project’s dependency list (as defined in `package.json`).

### Development Tooling
- **TypeScript**
- **Jest** + React Native testing tooling
- **Biome** for:
  - lint
  - format
  - typecheck
  - checks
- **Expo tooling** (managed via Expo/EAS scripts)
- **ts-node** for executing TypeScript tooling/scripts

### Testing Configuration (Jest)
- Uses a React Native–appropriate Jest preset (configured in `package.json`)
- Test discovery is configured to scan common test file patterns
- Coverage collection is scoped to the app/source area
- Transform ignore rules are set to avoid processing Expo/RN modules unnecessarily

---

## Project Architecture

Based on the repository configuration:

- **Entry point & routing**
  - The app uses **Expo Router**.
  - The entrypoint is configured as: `main: expo-router/entry`.

- **Primary project responsibilities**
  - Runtime logic is implemented as part of the Expo/React Native app.
  - Business logic and state are likely organized around:
    - **Zustand** stores
    - **Zod** schemas for validation
    - **Supabase** client for persistence/network requests
  - UI navigation and screen routing are handled through **Expo Router**.

- **Quality and reliability tooling**
  - Linting/formatting/typechecking via **Biome**
  - Tests via **Jest** with configured transforms and coverage collection
  - Optional test-data seeding via an npm script

> Note: Specific folder/module layout (e.g., where stores/schemas live) is not inferable from the provided summaries.

---

## Installation

> Placeholder instructions (repository scripts are defined in `package.json`, but exact runtime requirements are not included in the summaries).

1. **Install dependencies**
   bash
   npm install
   
2. *(Recommended)* Ensure you have the Expo/React Native tooling available in your environment (managed by Expo/EAS scripts).

---

## Usage

### Run the app
The repository defines npm scripts intended for starting on common targets:

- Start (Android/iOS/Web) via the Expo start script:
  bash
  npm run start
  

> If the repo includes target-specific commands beyond `start`, those are not inferable from the provided summaries.

### Lint / Format / Check
Use Biome-powered scripts (as defined in `package.json`):

bash
npm run lint
npm run format
npm run check
npm run typecheck


### Testing (Jest)
Run tests:
bash
npm test


Watch mode:
bash
npm test -- --watch


Coverage:
bash
npm test -- --coverage


### Seed test data
Seed data for tests or local development:
bash
npm run seed


### Build with EAS (Android / iOS)
Release builds are configured via EAS scripts:

- Android build:
  bash
  npm run build:android
  
- iOS build:
  bash
  npm run build:ios
  

---

## Development Notes

- **Dependency overrides** are configured in `package.json` to force specific versions. If you see unexpected lockfile changes or resolution warnings, check the `overrides` section first.
- Jest is configured with transform ignore rules to reduce noise/slowdowns from processing Expo/RN modules.
- Jest coverage collection is restricted to the relevant project scope as defined in the Jest configuration within `package.json`.

---

## Scripts Summary (from `package.json`)

- `start` — run Expo app (Android/iOS/Web)
- `lint` — Biome lint
- `format` — Biome format
- `check` — Biome checks
- `typecheck` — Biome typecheck
- `test` — Jest (with standard options; watch/coverage via flags)
- `seed` — seed test data
- `build:android` — EAS Android build
- `build:ios` — EAS iOS build

---

If you want, paste the repository’s folder tree (or key directories like `app/`, `src/`, `stores/`, `schemas/`), and I can extend the **Project Architecture** section with concrete module locations and call flows.

---
*This README was generated with [PresentMe](https://www.presentmeapp.xyz/). View the full presentation [here](https://www.presentmeapp.xyz/p/3577a75f-3069-4869-9771-60565ffceed9).*
