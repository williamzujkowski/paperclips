/**
 * Game constants and configuration values
 * These values don't change during gameplay
 */

// Game version
export const GAME_VERSION = '2.0.0';

// Save/Load constants
export const SAVE_KEY = 'universalPaperclipsSave';
export const AUTOSAVE_INTERVAL = 30000; // 30 seconds

// Display constants
export const DISPLAY_UPDATE_INTERVAL = 16; // ~60fps
export const BLINK_DURATION = 2000;
export const FADE_DURATION = 1500;

// Resource limits
export const MAX_PROCESSORS = 100;
export const MAX_MEMORY = 100;
export const MAX_TRUST = 100;

// Battle constants
export const MAX_BATTLES = 10;
export const BATTLE_NAMES = [
  'battles',
  'battles2',
  'battles3',
  'battles4',
  'battles5',
  'battles6',
  'battles7',
  'battles8',
  'battles9',
  'battles10',
];

// Quantum computing constants
export const QUANTUM_BASE_COST = 10000;
export const QUANTUM_COST_MULTIPLIER = 2;

// Project phases
export const PHASE = {
  EARTHBOUND: 1,
  SPACE: 2,
  UNIVERSAL: 3,
};

// Swarm gift thresholds
export const SWARM_GIFTS = [
  1000000,
  1000000000,
  1000000000000,
  1000000000000000,
];

// Number formatting thresholds
export const NOTATION_THRESHOLD = 1e6;
export const SCIENTIFIC_THRESHOLD = 1e21;

// Color schemes
export const COLORS = {
  PRIMARY: '#000000',
  SECONDARY: '#666666',
  SUCCESS: '#4CAF50',
  WARNING: '#FF9800',
  DANGER: '#F44336',
  QUANTUM: '#673AB7',
  SPACE: '#2196F3',
};

// Default starting values (for reference - actual values in GameState)
export const DEFAULTS = {
  STARTING_WIRE: 1000,
  STARTING_FUNDS: 0,
  STARTING_TRUST: 2,
  STARTING_PROCESSORS: 1,
  STARTING_MEMORY: 1,
  BASE_CLIP_PRICE: 0.01,
  BASE_WIRE_COST: 20,
  BASE_CLIPPER_COST: 5,
  BASE_MARKETING_COST: 100,
};

// Achievement thresholds
export const MILESTONES = {
  FIRST_MILLION: 1000000,
  FIRST_BILLION: 1000000000,
  FIRST_TRILLION: 1000000000000,
  FIRST_QUADRILLION: 1000000000000000,
  UNIVERSE_CONVERTED: Number.MAX_SAFE_INTEGER,
};

// Strategy engine values
export const STRATEGIES = {
  RANDOM: {
    name: 'RANDOM',
    description: 'Random choice',
    baseValue: 5,
  },
  GREEDY: {
    name: 'GREEDY',
    description: 'Choose the largest payoff',
    baseValue: 8,
  },
  GENEROUS: {
    name: 'GENEROUS',
    description: 'Choose the smallest payoff',
    baseValue: 3,
  },
  MINIMAX: {
    name: 'MINIMAX',
    description: 'Choose the least bad worst case',
    baseValue: 10,
  },
  TIT_FOR_TAT: {
    name: 'TIT_FOR_TAT',
    description: 'Mirror your opponent',
    baseValue: 10,
  },
  BEAT_LAST: {
    name: 'BEAT_LAST',
    description: 'Beat the last round',
    baseValue: 9,
  },
};

// Investment risk levels
export const RISK_LEVELS = {
  LOW: {
    name: 'low',
    variance: 0.05,
    returnMultiplier: 1.02,
  },
  MEDIUM: {
    name: 'med',
    variance: 0.15,
    returnMultiplier: 1.05,
  },
  HIGH: {
    name: 'high',
    variance: 0.30,
    returnMultiplier: 1.10,
  },
};

// UI element IDs (for backward compatibility)
export const UI_ELEMENTS = {
  MAIN_DISPLAY: 'mainDisplay',
  BUSINESS_DISPLAY: 'businessDisplay',
  MANUFACTURING_DISPLAY: 'manufacturingDisplay',
  COMPUTATIONAL_DISPLAY: 'computationalDisplay',
  PROJECTS_DISPLAY: 'projectsDisplay',
  SPACE_DISPLAY: 'spaceDisplay',
  END_SCREEN: 'endScreen',
};