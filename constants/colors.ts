/**
 * HomePulse Design System Tokens
 * Philosophy: Guided Reassurance
 */

export const COLORS = {
  // Foundation Neutrals
  background: '#F7F3EE',    // Warm off-white app base
  surface: '#FFFDFC',       // Secondary cards/sheets
  surfaceElevated: '#FFFFFF', // Primary elevated cards
  border: '#E5DED5',        // Soft separators
  
  // Text (Never pure black)
  textPrimary: '#2E2A27',   // Main readable text
  textSecondary: '#6B645E', // Supporting text
  
  // Brand / Semantic Roles
  primary: '#6C9A7D',       // Sage green
  focusRing: '#A7C5AF',
  disabledBG: '#E8E2DA',
  disabledText: '#9C958D',

  // State-Based Palettes
  state: {
    monitor: {
      primary: '#6C9A7D',   // State 1: Sage Green
      surface: '#E6F0E8',
      text: '#3E5E49',
    },
    care: {
      primary: '#D8A94A',   // State 2: Mustard
      surface: '#F8E9C9',
      text: '#7A5A17',
    },
    teleconsult: {
      primary: '#C9773A',   // State 3: Amber Orange
      surface: '#F6E1D2',
      text: '#7A4320',
    },
    urgent: {
      primary: '#B85450',   // State 4: Brick Red
      surface: '#F9E1DF',
      text: '#6A2C28',
    }
  }
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  xxxxl: 48,
  screenEdge: 20,
  sectionGap: 32,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 28, // Signature HomePulse rounding
  full: 9999,
} as const;
