/**
 * Game Constants for Universal Paperclips
 *
 * This file contains all the magic numbers and constants from the legacy codebase
 * organized into logical groups for better maintainability.
 */

// Game Balance Constants
export const BALANCE = {
  STARTING_FUNDS: 0,
  STARTING_WIRE: 1000,
  STARTING_CLIPS: 0,
  STARTING_TRUST: 2,
  STARTING_PROCESSORS: 1,
  STARTING_MEMORY: 1,

  // Clipmaker costs and rates
  CLIPMAKER_BASE_COST: 5,
  CLIPMAKER_RATE: 1, // clips per second per clipmaker

  // Wire costs
  WIRE_BASE_COST: 20,
  WIRE_PURCHASE_AMOUNT: 1000,

  // Marketing
  MARKETING_BASE_COST: 100,
  MARKETING_EFFECTIVENESS: 1,

  // MegaClipper
  MEGACLIPPER_BASE_COST: 500,
  MEGACLIPPER_RATE: 500, // clips per second

  // Factory
  FACTORY_BASE_COST: 100000000,
  FACTORY_RATE: 1000000000,
  FACTORY_POWER_CONSUMPTION: 200,

  // Space
  HARVESTER_BASE_COST: 1000000,
  HARVESTER_RATE: 26180337,
  WIRE_DRONE_BASE_COST: 1000000,
  WIRE_DRONE_RATE: 16180339,

  // Power
  SOLAR_FARM_BASE_COST: 10000000,
  SOLAR_FARM_RATE: 50,
  BATTERY_BASE_COST: 1000000,
  BATTERY_CAPACITY: 10000,
  DRONE_POWER_CONSUMPTION: 1,

  // Combat
  DISORGANIZATION_SYNCH_COST: 5000,
  ENTERTAINMENT_COST: 10000,
  THRENODY_COST: 50000,

  // Swarm
  SWARM_GIFT_PERIOD: 125000,

  // Trust
  TRUST_NEXT_THRESHOLD: 3000,
  TRUST_MAX: 20,
  TRUST_MAX_COST: 91117.99,

  // Quantum
  QUANTUM_CHIP_COST: 10000,

  // UI
  DRIFT_KING_MESSAGE_COST: 1,
  BRIBE_COST: 1000000,

  // Matter
  MATTER_AVAILABLE: Math.pow(10, 24) * 6000,
  MATTER_TOTAL: Math.pow(10, 54) * 30,
  MATTER_FOUND: Math.pow(10, 24) * 6000
};

// Timing Constants
export const TIMING = {
  GAME_LOOP_INTERVAL: 16, // ~60 FPS
  SLOW_LOOP_INTERVAL: 1000, // 1 second
  MEDIUM_LOOP_INTERVAL: 100, // 10 times per second
  FAST_LOOP_INTERVAL: 10, // 100 times per second (legacy)

  // Fade delays
  OPERATIONS_FADE_DELAY: 800,

  // Wire price timer
  WIRE_PRICE_TIMER_MAX: 100
};

// UI Constants
export const UI = {
  SLIDER_MIN: 0,
  SLIDER_MAX: 100,
  BLINK_DURATION: 500,

  // Element IDs (for reference)
  ELEMENTS: {
    CLIPS_DISPLAY: 'clips',
    FUNDS_DISPLAY: 'funds',
    WIRE_DISPLAY: 'wire',
    OPERATIONS_DISPLAY: 'operations',
    TRUST_DISPLAY: 'trust',
    PROCESSORS_DISPLAY: 'processors',
    MEMORY_DISPLAY: 'memory'
  }
};

// Feature Flags
export const FEATURES = {
  QUANTUM_COMPUTING: 'quantum',
  SPACE_EXPLORATION: 'space',
  COMBAT_SYSTEM: 'combat',
  SWARM_COMPUTING: 'swarm',
  INVESTMENT_ENGINE: 'investment',
  WIRE_PRODUCTION: 'wireProduction',
  TOURNAMENTS: 'tournaments'
};

// Game Phases
export const PHASES = {
  EARLY_GAME: 0, // Manual clipping
  AUTOMATION: 1, // Clipmakers and marketing
  COMPUTATION: 2, // Trust and processors
  SPACE: 3, // Space exploration
  COMBAT: 4, // Probe combat
  ENDGAME: 5 // Final stages
};

// Project Categories
export const PROJECT_CATEGORIES = {
  EFFICIENCY: 'efficiency',
  CREATIVITY: 'creativity',
  INVESTMENT: 'investment',
  MANUFACTURING: 'manufacturing',
  COMPUTING: 'computing',
  SPACE: 'space',
  COMBAT: 'combat'
};

// Error Messages
export const ERRORS = {
  INSUFFICIENT_FUNDS: 'Insufficient funds',
  INSUFFICIENT_WIRE: 'Insufficient wire',
  INSUFFICIENT_TRUST: 'Insufficient trust',
  INSUFFICIENT_OPERATIONS: 'Insufficient operations',
  SAVE_FAILED: 'Failed to save game',
  LOAD_FAILED: 'Failed to load game',
  INVALID_SAVE: 'Invalid save data'
};

// Achievement Thresholds
export const ACHIEVEMENTS = {
  CLIPS_MILESTONES: [
    1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000, 10000000000, 100000000000,
    1000000000000
  ],
  FUNDS_MILESTONES: [1000, 10000, 100000, 1000000, 10000000, 100000000],
  TIME_MILESTONES: [
    60000, // 1 minute
    300000, // 5 minutes
    1800000, // 30 minutes
    3600000, // 1 hour
    7200000, // 2 hours
    14400000, // 4 hours
    28800000, // 8 hours
    86400000 // 24 hours
  ]
};

// Mathematical Constants
export const MATH = {
  E: Math.E,
  PI: Math.PI,
  GOLDEN_RATIO: (1 + Math.sqrt(5)) / 2,

  // Fibonacci sequence starters (legacy)
  FIB1: 2,
  FIB2: 3,

  // Large number thresholds
  THOUSAND: 1000,
  MILLION: 1000000,
  BILLION: 1000000000,
  TRILLION: 1000000000000,
  QUADRILLION: 1000000000000000,

  // Exponential thresholds
  SCIENTIFIC_NOTATION_THRESHOLD: 1000000,

  // Rounding precision
  CURRENCY_PRECISION: 2,
  RATE_PRECISION: 2,
  LARGE_NUMBER_PRECISION: 3
};

// Audio Constants
export const AUDIO = {
  VOLUME_LEVELS: {
    MUTED: 0,
    LOW: 0.25,
    MEDIUM: 0.5,
    HIGH: 0.75,
    MAX: 1.0
  },

  // Audio file paths (when implemented)
  SOUNDS: {
    CLICK: 'audio/click.wav',
    SUCCESS: 'audio/success.wav',
    ERROR: 'audio/error.wav',
    THRENODY: 'audio/threnody.mp3'
  }
};

// Performance Constants
export const PERFORMANCE = {
  MAX_FPS: 60,
  MIN_FPS: 30,
  FRAME_TIME_TARGET: 16.67, // ms for 60 FPS
  PERFORMANCE_SAMPLE_SIZE: 60,

  // DOM update batching
  MAX_DOM_UPDATES_PER_FRAME: 10,

  // Memory thresholds
  MAX_MEMORY_USAGE: 100 * 1024 * 1024, // 100MB

  // Save frequency
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds

  // Debounce delays
  SAVE_DEBOUNCE: 1000,
  RESIZE_DEBOUNCE: 250
};

// Debug Constants
export const DEBUG = {
  LOG_LEVELS: {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
  },

  // Debug commands
  COMMANDS: {
    ADD_CLIPS: 'addClips',
    ADD_FUNDS: 'addFunds',
    ADD_WIRE: 'addWire',
    RESET_GAME: 'reset',
    EXPORT_SAVE: 'export',
    IMPORT_SAVE: 'import',
    GET_STATE: 'getState',
    SET_LOG_LEVEL: 'setLogLevel'
  }
};

// Version Information
export const VERSION = {
  MAJOR: 2,
  MINOR: 0,
  PATCH: 0,
  BUILD: 'development',
  FULL: '2.0.0-development'
};

// Export all constants as a single object for convenience
export const CONSTANTS = {
  BALANCE,
  TIMING,
  UI,
  FEATURES,
  PHASES,
  PROJECT_CATEGORIES,
  ERRORS,
  ACHIEVEMENTS,
  MATH,
  AUDIO,
  PERFORMANCE,
  DEBUG,
  VERSION
};
